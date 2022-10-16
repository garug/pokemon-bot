import axios from "axios";
import { v4 } from "uuid";
import { BattleEnergy, BattlePlayer } from "./BattlePlayer";
import { BattleTurn } from "./BattleTurn";
import { GeneratedEnergy, isGeneratedEnergy, isMove } from "../dice/dice";
import { Move, Types } from "../dice/moves";
import { BattlePokemon } from "./BattlePokemon";
import { sort } from "../../lib/utils";

export class Match {

    id = v4();

    turns: BattleTurn[] = [];

    activePlayer: BattlePlayer;

    oddPlayer: BattlePlayer;

    activeTurn!: BattleTurn;

    constructor(player1: BattlePlayer, player2: BattlePlayer) {
        const players = [ player1, player2 ];
        this.activePlayer = sort(players);
        this.oddPlayer = players.find(p => p !== this.activePlayer)!;
        this.newTurn(false);
    }

    endReroll() {
        Object.entries(this.generateEnergies())
            .forEach(([ key, value ]) => {
                this.activePlayer.energies[key] = (this.activePlayer.energies[key] || 0) + value;
            });
        this.activeTurn.phase = "choosing";
    }

    async endActions() {
        this.activeTurn.phase = "resolving";
        // apply damage
        for (const id of this.activeTurn.incomingOrder) {
            const pokemon = this.oddPlayer.pokemon.find(pokemon => pokemon.id === id);

            if (!pokemon)
                throw Error("error01");

            await pokemon.useMove(this.oddPlayer.energies);
        }

        // finish effects
        this.activePlayer.pokemon
            .filter(pokemon => isMove(pokemon.dice.activeFace))
            .map(pokemon => pokemon.dice.activeFace as Move)
            .forEach(move => move.onFinish?.(this));

        // tick conditions
        this.activePlayer.pokemon
            .filter(pokemon => !pokemon.isDead)
            .forEach(pokemon => pokemon.tickConditions());
    }

    newTurn(changePlayer = true) {
        this.activeTurn && (this.activeTurn.phase = "ending");
        if (changePlayer) {
            const tempPlayer = this.activePlayer;
            this.activePlayer = this.oddPlayer;
            this.oddPlayer = tempPlayer;
        }

        this.activeTurn = new BattleTurn(this.activePlayer, this.activeTurn ? this.activeTurn.outcomeOrder : []);
        this.turns.push(this.activeTurn);
    }

    toggleTarget(pokemon: BattlePokemon, target: BattlePokemon) {
        const alreadyTargeted = pokemon.targets.find(p => p.id === target.id);

        if (alreadyTargeted)
            this.targetPokemon(pokemon, target);
        else
            this.untargetPokemon(pokemon, target);
    }

    private targetPokemon(pokemon: BattlePokemon, target: BattlePokemon) {
        pokemon.targets = [ ...pokemon.targets.filter(p => p.id !== target.id) ];
        this.activeTurn.outcomeOrder = this.activeTurn.outcomeOrder.filter(e => e !== pokemon.id);
    }

    private untargetPokemon(pokemon: BattlePokemon, target: BattlePokemon) {
        if (!this.validPokemon(pokemon))
            return;

        if (!isMove(pokemon.dice.activeFace))
            return;

        pokemon.targets.push(target);
        this.activeTurn.outcomeOrder.push(pokemon.id);
    }

    private generateEnergies() {
        return this.activePlayer.pokemon
            .filter(pokemon => isGeneratedEnergy(pokemon.dice.activeFace))
            .filter(pokemon => pokemon.conditions.paralyzed ? Math.random() > 0.5 : true)
            .map(pokemon => pokemon.dice.activeFace as GeneratedEnergy)
            .reduce((acc, energy) => {
                acc[energy.type] = (acc[energy.type] || 0) + energy.value;
                return acc;
            }, {} as BattleEnergy);
    }

    private validPokemon(pokemon: BattlePokemon) {
        return this.activePlayer.pokemon.find(p => p.id === pokemon.id);
    }
}

export type Effectiveness = 0 | 0.5 | 1 | 2;

export async function checkEffectiveness(move: Types, ...on: any[]): Promise<Effectiveness> {
    if (move === "any")
        return 1;

    const type = (await axios.get(`https://pokeapi.co/api/v2/type/${ move }`)).data;
    const { damage_relations } = type;

    const compareFn = e => on.some(o => o === e.name);

    if (damage_relations.no_damage_to.some(compareFn)) {
        return 0;
    } else if (damage_relations.half_damage_to.some(compareFn)) {
        return 0.5;
    } else if (damage_relations.double_damage_to.some(compareFn)) {
        return 2;
    } else {
        return 1;
    }
}
