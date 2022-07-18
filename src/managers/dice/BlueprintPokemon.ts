import {Move, Types} from "./moves";

export interface BlueprintPokemon {
    types: [Types, Types?],
    availableMoves: BlueprintMove[]
}

export interface BlueprintMove {
    move: Move,
    baseValue: number
}
