// TODO remover
import { Match } from "./Match";
import { BattlePlayer } from "./BattlePlayer";
import { generateDice as generateReal } from "../dice/dice";
import { BattlePokemon } from "./BattlePokemon";
import { BattleDice } from "./BattleDice";
import { random } from "lodash";
import { BattleTurn } from "./BattleTurn";
import { v4 } from "uuid";

export async function generateMatch(id1 = "p1", id2 = "p2") {
    const [pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6] = await Promise.all(Array.from({length: 6}).map(() => generatePokemon()));
    const player1 = new BattlePlayer(id1, [pokemon1, pokemon2, pokemon3]);
    const player2 = new BattlePlayer(id2, [pokemon4, pokemon5, pokemon6]);
    return new Match(player1, player2);
}

export async function generatePokemon() {
    const dice = await generateReal("charmander");
    return new BattlePokemon(new BattleDice(dice), {
        hp: random(10, 100),
        sp_defense: random(1, 100),
        defense: random(1, 100),
        sp_attack: random(1, 100),
        attack: random(1, 100),
        speed: random(1, 100),
    });
}

export async function generateTurn() {
    return new BattleTurn((await generatePlayer()), []);
}

export function generateDice() {
    return new BattleDice({} as any);
}

export async function generatePlayer() {
    const pokemon = await Promise.all(Array.from({length: 3}).map(() => generatePokemon()));
    return new BattlePlayer(v4(), pokemon);
}