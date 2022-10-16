
import { BattlePokemon } from "./BattlePokemon";
import { generatePokemon } from "./utils";
import { BattleEnergy } from "./BattlePlayer";

describe("BattlePokemon", () => {
    it("should exists", () => {
    });

    it("shouldnt use a move without energy", async () => {
        const usedEnergies: BattleEnergy = {};
        const pokemon = await generatePokemon();
        pokemon.dice.activeFace = {
            name: "test move",
            energy: [
                {
                    type: "any",
                    value: 1
                }
            ],
        }
        const usedMove = await pokemon.useMove(usedEnergies);
        expect(usedMove).toBe("not-enough-energy");
    });
});
