import { BlueprintPokemon } from "../BlueprintPokemon";
import { flare, gnaw, recklessCharge, tailOnFire } from "../moves";

export const pokemon: BlueprintPokemon = {
    types: ["fire"],
    availableMoves: [
        {
            move: tailOnFire,
            baseValue: 100
        },
        {
            move: flare,
            baseValue: 100,
        },
        {
            move: recklessCharge,
            baseValue: 100
        },
        {
            move: gnaw,
            baseValue: 100
        }
    ]
}
