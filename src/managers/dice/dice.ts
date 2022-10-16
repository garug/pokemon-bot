import { Move, Types } from "./moves";
import { BlueprintPokemon } from "./BlueprintPokemon";
import { sort } from "../../lib/utils";
import { shuffle } from "lodash";
import { Attributes } from "@models/OwnedPokemon";

export interface GeneratedEnergy {
    type: Types,
    value: number,
}

export type Face = Move | GeneratedEnergy | "empty";

export type DiceMoves = [Face, Face, Face, Face, Face, Face];

export interface Dice {
    types: [Types, Types?],
    moves: DiceMoves;
}

export async function generateDice(pokemonName: string): Promise<Dice> {
    const {pokemon}: Required<{ pokemon: BlueprintPokemon }> = await import(`./blueprints/${pokemonName}`);
    const face1 = generateMove(pokemon);
    const face2 = generateEnergy(pokemon);
    const face3 = Math.random() >= 0.25 ? generateMoveOrEnergy(pokemon) : "empty";
    const face4 = Math.random() > 0.95 ? generateMoveOrEnergy(pokemon) : "empty";
    let face5: Face = "empty";
    let face6: Face = "empty";

    if (face3 !== "empty") {
        const isEnergy = isGeneratedEnergy(face3);

        if (Math.random() >= 0.5)
            face5 = isEnergy ? generateMove(pokemon) : generateEnergy(pokemon);

        if (Math.random() >= 0.875)
            face6 = isEnergy ? generateEnergy(pokemon) : generateMove(pokemon);
    }

    return {
        types: pokemon.types,
        moves: shuffle([face1, face2, face3, face4, face5, face6]) as DiceMoves
    };
}

function generateEnergy(pokemon: BlueprintPokemon): GeneratedEnergy {
    return {
        type: pokemon.types[1] ? sort(pokemon.types)! : pokemon.types[0],
        value: Math.random() > 0.75 ? 2 : 1,
    }
}

function generateMoveOrEnergy(pokemon: BlueprintPokemon): Move | GeneratedEnergy {
    return Math.random() > 0.5 ? generateMove(pokemon) : generateEnergy(pokemon);
}

function generateMove(pokemon: BlueprintPokemon): Move {
    const sortedBlueprintMove = sort(pokemon.availableMoves, move => move.baseValue);
    return sortedBlueprintMove.move;
}

export function isMove(object: Face) {
    if (typeof object !== 'object')
        return false;

    const nameExists = "name" in object;
    const energyExists = "energy" in object;

    return nameExists && energyExists;
}

export function isGeneratedEnergy(object: Face) {
    if (typeof object !== 'object')
        return false;

    const valueExists = "value" in object;
    const typeExists = "type" in object;

    return valueExists && typeExists;
}
