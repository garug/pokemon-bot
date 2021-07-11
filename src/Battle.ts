import { Subject } from "rxjs";
import { v4 as uuid } from "uuid";
import Move, { ModifyAttribute, MoveResult } from "./lib/moves";
import Pokemon, { Attribute } from "./Pokemon";
import { publicPokemon, useSocket } from "./socket";

interface PlayerOptions {
  name: string;
  pokemon: [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];
}

export class Player {
  name: string;
  private inBattleIndex: number;
  private usedPokemon: number[];
  pokemon: InBattlePokemon[];

  get inBattle() {
    return this.pokemon[this.inBattleIndex];
  }

  get alreadyUsed() {
    return this.usedPokemon.map((index) => this.pokemon[index]);
  }

  constructor(opt: PlayerOptions) {
    this.name = opt.name;
    this.pokemon = opt.pokemon.map((p) => new InBattlePokemon(p));
    this.inBattleIndex = 0;
    this.usedPokemon = [0];
  }

  changeActivePokemon(pokemon: InBattlePokemon) {
    const index = this.pokemon.findIndex(
      (p) => p.originalPokemon.name === pokemon.originalPokemon.name
    );
    this.inBattleIndex = index;

    if (!this.usedPokemon.find((e) => e === index)) {
      this.usedPokemon.push(index);
    }
  }
}

export interface Turn {
  p1?: Move | InBattlePokemon;
  p2?: Move | InBattlePokemon;
  events: String[];
}

interface Event {
  id: string;
  value: any;
}

export default class Battle {
  id: string;
  p1: Player;
  p2: Player;
  visitorKey: string;

  private eventsSubject = new Subject<Event>();

  get events() {
    return this.eventsSubject.asObservable();
  }

  currentTurn: Turn = { events: [] };

  turns: Turn[];

  constructor(p1: PlayerOptions, p2: PlayerOptions) {
    this.id = uuid();
    this.visitorKey = uuid();
    this.p1 = new Player(p1);
    this.p2 = new Player(p2);
    this.turns = [
      {
        events: [
          `${this.p1.name} sent a ${this.p1.inBattle.originalPokemon.name}`,
          `${this.p2.name} sent a ${this.p2.inBattle.originalPokemon.name}`,
        ],
      },
    ];
    setTimeout(
      () => this.eventsSubject.next({ id: "start", value: "Battle Begin!" }),
      100
    );
  }

  registerAction(player: Player, action: Move | InBattlePokemon) {
    if (player === this.p1) {
      this.currentTurn.p1 = action;
    } else if (player === this.p2) {
      this.currentTurn.p2 = action;
    } else {
      console.warn("Invalid player");
    }
  }

  waitingOther(player: Player) {
    if (player === this.p1) {
      return !!this.currentTurn.p2;
    } else if (player === this.p2) {
      return !!this.currentTurn.p1;
    } else {
      console.warn("Invalid player");
    }
  }

  useMove(user: "p1" | "p2") {
    const target = user === "p1" ? "p2" : "p1";

    const userPokemon = new InBattlePokemon(this[user].inBattle);
    const targetPokemon = new InBattlePokemon(this[target].inBattle);

    const multiplier = (value: number): number => {
      const possibilities: any = {
        "-6": 2 / 8,
        "-5": 2 / 7,
        "-4": 2 / 6,
        "-3": 2 / 5,
        "-2": 2 / 4,
        "-1": 2 / 3,
        "1": 3 / 2,
        "2": 4 / 2,
        "3": 5 / 2,
        "4": 6 / 2,
        "5": 7 / 2,
        "6": 8 / 2,
      };

      return possibilities[value.toString()] || 0;
    };

    userPokemon.attributeModifier.forEach(
      (mod) =>
        (userPokemon.originalPokemon.base_stats[mod.attribute] *= multiplier(
          mod.value
        ))
    );
    targetPokemon.attributeModifier.forEach(
      (mod) =>
        (userPokemon.originalPokemon.base_stats[mod.attribute] *= multiplier(
          mod.value
        ))
    );

    return (this.currentTurn[user] as Move).use(
      userPokemon.originalPokemon,
      targetPokemon.originalPokemon
    );
  }

  applyAttributeModifier(modify: ModifyAttribute, pokemon: InBattlePokemon) {
    const attribute = pokemon.attributeModifier.find(
      (a) => a.attribute === modify.name
    );

    if (attribute) {
      attribute.value += modify.value;
    } else {
      pokemon.attributeModifier.push({
        attribute: modify.name,
        value: modify.value,
      });
    }
  }

  applyResult(result: MoveResult, target: "p1" | "p2") {
    const user = target === "p1" ? "p2" : "p1";

    if (result.damage) {
      const damage = result.damage * 5;
      this[target].inBattle.hp -= damage;
      useSocket().to(this.id).emit("resultDamage", {
        target: this[target].inBattle.originalPokemon.id,
        damage,
      });
      this.eventsSubject.next({
        id: "resultDamage",
        value: { target, damage: result.damage },
      });
    }

    if (result.target) {
      result.target.forEach((mod) =>
        this.applyAttributeModifier(mod, this[target].inBattle)
      );
    }

    if (result.user) {
      result.user.forEach((mod) =>
        this.applyAttributeModifier(mod, this[user].inBattle)
      );
    }
  }

  rollMove(user: "p1" | "p2") {
    const target = user === "p1" ? "p2" : "p1";

    const move = this.currentTurn[user];
    if (move instanceof Move) {
      const result = this.useMove(user);
      this.eventsSubject.next({
        id: "pokemonMove",
        value: { player: user, move: move.name },
      });
      this.applyResult(result, target);
    }

    const targetMove = this.currentTurn[target];
    if (this[target].inBattle.hp > 0 && targetMove instanceof Move) {
      const result = this.useMove(target);
      this.eventsSubject.next({
        id: "pokemonMove",
        value: { player: target, move: targetMove.name },
      });
      this.applyResult(result, user);
    }
  }

  rollTurn() {
    if (this.currentTurn.p1 && this.currentTurn.p2) {
      if (this.currentTurn.p1 instanceof InBattlePokemon) {
        useSocket()
          .to(this.id)
          .emit("changePokemon", {
            player: "p1",
            out: this.p1.inBattle,
            in: publicPokemon(this.currentTurn.p1),
          });
        this.eventsSubject.next({
          id: "changePokemon",
          value: {
            player: "p1",
            out: this.p1.inBattle.originalPokemon.name,
            in: this.currentTurn.p1.originalPokemon.name,
          },
        });
        this.p1.changeActivePokemon(this.currentTurn.p1);
      }

      if (this.currentTurn.p2 instanceof InBattlePokemon) {
        useSocket()
          .to(this.id)
          .emit("changePokemon", {
            player: "p2",
            out: this.p2.inBattle,
            in: publicPokemon(this.currentTurn.p2),
          });
        this.eventsSubject.next({
          id: "changePokemon",
          value: {
            player: "p2",
            out: this.p1.inBattle.originalPokemon.name,
            in: this.currentTurn.p2.originalPokemon.name,
          },
        });
        this.p2.changeActivePokemon(this.currentTurn.p2);
      }

      const difference = this.p1.inBattle.speed - this.p2.inBattle.speed;

      if (difference < 0) {
        this.rollMove("p1");
      } else if (difference > 0) {
        this.rollMove("p2");
      } else {
        this.rollMove(Math.random() > 0.5 ? "p1" : "p2");
      }

      this.currentTurn = { events: [] };
      const p1Defeat = this.p1.inBattle.hp <= 0;
      const p2Defeat = this.p2.inBattle.hp <= 0;
      this.eventsSubject.next({
        id: "resultTurn",
        value: {
          defeats: {
            p1: p1Defeat,
            p2: p2Defeat,
          },
        },
      });
      this.turns.push(this.currentTurn);
    }
  }
}

interface InBattleAttributeModifier {
  attribute: Attribute;
  value: number;
}

export class InBattlePokemon {
  originalPokemon: Pokemon;
  hp: number;
  totalHp: number;
  attributeModifier: InBattleAttributeModifier[];

  get speed() {
    return this.originalPokemon.base_stats.speed;
  }

  constructor(pokemon: Pokemon | InBattlePokemon) {
    if (pokemon instanceof Pokemon) {
      this.originalPokemon = pokemon;
      this.attributeModifier = [];
      const base = (2 * pokemon.base_stats.hp * pokemon.level) / 100;
      this.hp = this.totalHp = base + pokemon.level + 10;
    } else {
      this.originalPokemon = pokemon.originalPokemon;
      this.attributeModifier = pokemon.attributeModifier;
      this.hp = this.totalHp = pokemon.hp;
    }
  }
}
