import { BattlePokemon } from "../dice-battle/BattlePokemon";
import { Match } from "../dice-battle/Match";

export type Types = "any" | "fire" | "water" | "grass" | "poison" | "steel";

export interface MoveType {
    type: Types,

    value: number
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export interface Move {
    name: string;

    energy: MoveType[],

    description?: string;

    type?: "physical" | "special",

    damage?: number;

    modifyDamage?: (damage: number) => number,

    onHit?: (me: BattlePokemon, target: BattlePokemon) => void,

    onFinish?: (match: Match) => void
}

export type MoveAttack = WithRequired<Move, 'damage' | 'type'>;

// SQUIRTLE MOVES
export const waterSplash: MoveAttack = {
    name: "water splash",
    type: "physical",
    damage: 10,
    energy: [
        {
            type: "water",
            value: 1,
        },
        {
            type: "any",
            value: 1,
        },
    ],
    modifyDamage: (damage) => Math.random() > 0.5 ? damage : damage + 20,
    description: "50% de chance de causar +20 de dano base"
};

export const tackle: MoveAttack = {
    name: "tackle",
    type: "physical",
    energy: [{
        type: "any",
        value: 1,
    }],
    damage: 10,
};

export const bubble: Move = {
    name: "bubble",
    energy: [
        {
            type: "water",
            value: 1,
        },
    ],
    description: "50% de chance de deixar adversário paralizado",
    onHit: (me, target) => {
        const test = Math.random() > 0.5;

        if (test) {
            target.applyCondition("paralyzed");
        }
    },
};

export const waterGun: MoveAttack = {
    name: "water gun",
    type: "special",
    energy: [
        {
            type: "water",
            value: 1,
        },
        {
            type: "any",
            value: 1,
        },
    ],
    damage: 25,
};

// CHARMANDER MOVES
export const tailOnFire: MoveAttack = {
    name: "tail on fire",
    type: "physical",
    energy: [
        {
            type: "fire",
            value: 1,
        },
    ],
    damage: 10,
    description: "Ao final do turno, gera 1x energia fogo. Caso acerte, aplica a condição de sono ao alvo",
    onFinish: (match) => {
        match.activePlayer.energies.fire = (match.activePlayer.energies.fire || 0) + 1;
    },
    onHit: (me, target) => {
        target.applyCondition("sleep")
    },
};

export const flare: MoveAttack = {
    name: "flare",
    type: "special",
    energy: [
        {
            type: "fire",
            value: 2,
        },
    ],
    damage: 30,
    description: "Caso acerte, aplica a condição de sono ao alvo",
    onHit: (me, target) => {
        target.applyCondition("sleep")
    },
};

export const recklessCharge: MoveAttack = {
    name: "reckless charge",
    type: "physical",
    damage: 20,
    energy: [
        {
            type: "any",
            value: 1,
        },
    ],
    description: "Causa 10 de dano em si mesmo",
    onHit: (me, target) => {
        me.hp.current -= 10;
    },
};

export const gnaw: MoveAttack = {
    name: "Gnaw",
    energy: [
        {
            type: "fire",
            value: 1,
        },
    ],
    damage: 10,
    type: "physical",
    description: "Aplica a condição de sono ao alvo",
    onHit: (me, target) => {
        target.applyCondition("sleep")
    },
};

// BULBASAUR MOVES
export const vineWhipe: MoveAttack = {
    name: "vine whip",
    energy: [
        {
            type: "grass",
            value: 1,
        },
    ],
    damage: 10,
    type: "physical",
};

export const razorLeaf: MoveAttack = {
    name: "razor leaf",
    energy: [
        {
            type: "grass",
            value: 1,
        },
        {
            type: "any",
            value: 1,
        },
    ],
    damage: 20,
    type: "special",
};

export const ram: MoveAttack = {
    name: "ram",
    energy: [
        {
            type: "any",
            value: 1,
        },
    ],
    damage: 10,
    type: "physical",
};

export const sleepPowder: MoveAttack = {
    name: "sleep powder",
    energy: [
        {
            type: "grass",
            value: 1,
        },
        {
            type: "any",
            value: 1,
        },
    ],
    damage: 10,
    type: "special",
    description: "Aplica a condição de sono ao alvo",
    onHit: (me, target) => {
        target.applyCondition("sleep")
    },
};
