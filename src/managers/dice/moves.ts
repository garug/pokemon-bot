export type Types = "any" | "fire" | "water" | "grass";

export interface MoveType {
    type: Types,
    value: number
}

export interface Move {
    name: string;
    energy: MoveType[],
    damage?: number;
    modifyDamage?: (damage: number) => number,
    onHit?: (me, target) => void,
    onFinish?: () => void
}

// SQUIRTLE MOVES
export const waterSplash: Move = {
    name: "water splash",
    damage: 10,
    energy: [
        {
            type: "any",
            value: 1
        },
        {
            type: "water",
            value: 1
        }
    ],
    modifyDamage: (damage) => Math.random() > 0.5 ? damage : damage + 20
}

export const tackle: Move = {
    name: "tackle",
    energy: [{
        type: "any",
        value: 1
    }],
    damage: 10
}

export const bubble: Move = {
    name: "bubble",
    energy: [
        {
            type: "water",
            value: 1
        }
    ],
    onHit: (me, target) => {
        const test = Math.random() > 0.5;

        if (test) {
            // TODO inflict paralyzed on target
        }
    }
}

export const waterGun: Move = {
    name: "water gun",
    energy: [
        {
            type: "any",
            value: 1
        },
        {
            type: "water",
            value: 1
        }
    ],
    damage: 25
}

// CHARMANDER MOVES
export const tailOnFire: Move = {
    name: "tail on fire",
    energy: [
        {
            type: "fire",
            value: 1
        }
    ],
    damage: 10,
    onFinish: () => {
        // TODO add 1 fire energy
    }
}

export const flare: Move = {
    name: "flare",
    energy: [
        {
            type: "fire",
            value: 2
        }
    ],
    damage: 30
}

export const recklessCharge: Move = {
    name: "reckless charge",
    energy: [
        {
            type: "any",
            value: 1
        },
    ],
    onHit: (me, target) => {
        // TODO does 10 damage itself
    }
}

export const gnaw: Move = {
    name: "Gnaw",
    energy: [
        {
            type: "fire",
            value: 1
        }
    ],
    damage: 10
}

// BULBASAUR MOVES
export const vineWhipe: Move = {
    name: "vine whip",
    energy: [
        {
            type: "grass",
            value: 1
        }
    ],
    damage: 10,
}

export const razorLeaf: Move = {
    name: "razor leaf",
    energy: [
        {
            type: "grass",
            value: 1
        },
        {
            type: "any",
            value: 1
        }
    ],
    damage: 20
}

export const ram: Move = {
    name: "ram",
    energy: [
        {
            type: "any",
            value: 1
        }
    ],
    damage: 10
}

export const sleepPowder: Move = {
    name: "sleep powder",
    energy: [
        {
            type: "grass",
            value: 1,
        },
        {
            type: "any",
            value: 1
        }
    ],
    damage: 10,
    onHit: (me, target) => {
        // TODO defending pokemon is now asleep
    }
}
