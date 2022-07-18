import { Attributes } from "@models/OwnedPokemon";
import { Move } from "./moves";

export interface Pokemon {
    moves: Moves,
    attributes: Attributes,
}

export type Moves = [Move, Move, Move, Move];