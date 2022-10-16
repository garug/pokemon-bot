import { BattlePokemon } from "./BattlePokemon";

export type ConditionName = "paralyzed" | "sleep";

export type PossibleConditions = {
    [key in ConditionName]?: AppliedCondition
}

type AvailableConditions = {
    [key in ConditionName]: () => AppliedCondition
}

type Tick = (pokemon: BattlePokemon) => void;

type AppliedCondition = {
    turns: number,
    tick?: Tick,
}

export const availableConditions: AvailableConditions = {
    sleep: () => defaultCondition((turns) => (pokemon) => {
        if (turns > 2 || Math.random() > 0.5)
            pokemon.removeCondition("sleep");
        else
            turns++;
    }),
    paralyzed: () => defaultCondition((turns) => (pokemon) => {
        if (turns > 4)
            pokemon.removeCondition("paralyzed");
        else
            turns++;
    }),
};

type CreateCondition = (turns: number) => (pokemon: BattlePokemon) => void;

function defaultCondition(tick?: CreateCondition): AppliedCondition {
    const turns = 0;

    return {
        turns,
        tick: tick?.(turns),
    };
}