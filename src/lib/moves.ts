import Pokemon, { Attribute } from "../Pokemon";
import { randomFromInterval } from "./utils";

export default class Move {
  name: string;
  power: number;
  pp: number;
  accuracy: number;
  type: string;
  category: string;

  constructor(opt: MoveOptions) {
    this.name = opt.name;
    this.power = opt.power || 0;
    this.pp = opt.pp;
    this.category = opt.category;
    this.accuracy = opt.accuracy || 100;
    this.type = opt.type || "normal";
    this.use = opt.use || this.use;
  }

  use: pokemonMove = (user, target) => {
    if (this.category === "physical") {
      const userAtb = user.base_stats.speed;
      const targetAtb = target.base_stats.speed;
      const chance = this.accuracy * Math.min(userAtb / targetAtb, 1);
      const hit = chance >= randomFromInterval(1, 100);

      if (!hit) {
        return { misses: true };
      }

      const userDmg = user.base_stats.attack;
      const targetDef = target.base_stats.defense;
      const base = (this.power * (userDmg / targetDef)) / 50;
      const stab = user.types.some((t) => t === this.type) ? 2 : 1;
      // TODO aplicar vantagem de tipo
      const vantagemTipo = 1;
      const damage = base * stab * vantagemTipo * randomFromInterval(0.85, 1);

      return { damage };
    } else {
      const userAtb = user.base_stats.speed;
      const targetAtb = target.base_stats.speed;
      const chance = this.accuracy * Math.min(userAtb / targetAtb, 1);
      const hit = chance >= randomFromInterval(1, 100);

      if (!hit) {
        return { misses: true };
      }

      const userDmg = user.base_stats.sp_attack;
      const targetDef = target.base_stats.sp_defense;
      const base = (this.power * (userDmg / targetDef)) / 50;
      const stab = user.types.some((t) => t === this.type) ? 2 : 1;
      const damage = base * stab * randomFromInterval(0.85, 1);

      return { damage };
    }
  };
}

interface MoveOptions {
  name: string;
  pp: number;
  category: string;
  power?: number;
  type?: string;
  accuracy?: number;
  use?: pokemonMove;
}

export interface MoveResult {
  damage?: number;
  misses?: boolean;
  user?: ModifyAttribute[];
  target?: ModifyAttribute[];
}

export interface ModifyAttribute {
  name: Attribute;
  value: number;
}

type pokemonMove = (user: Pokemon, target: Pokemon) => MoveResult;

const tackle = new Move({
  name: "Tackle",
  type: "normal",
  category: "physical",
  power: 40,
  pp: 35,
});

const growl = new Move({
  name: "Growl",
  category: "status",
  pp: 40,
  use: () => {
    return {
      target: [
        {
          name: "attack",
          value: -1,
        },
      ],
    };
  },
});

const vineWhip = new Move({
  name: "Vine Whip",
  category: "physical",
  type: "grass",
  pp: 25,
  power: 45,
});

const growth = new Move({
  name: "Growth",
  category: "status",
  pp: 20,
  use: () => {
    return {
      user: [
        {
          name: "attack",
          value: 1,
        },
        {
          name: "sp_attack",
          value: 1,
        },
      ],
    };
  },
});

export const moves: [Move, Move, Move, Move] = [
  tackle,
  growl,
  vineWhip,
  growth,
];
