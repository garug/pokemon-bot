import { checkEffectiveness, Match } from "./Match";
import { isMove } from "../dice/dice";
import { generateMatch } from "./utils";

describe("checkEffectiviness", () => {

    it("should return 0 on type no damage", async () => {
        const effectiviness = await checkEffectiveness("poison", "steel");
        expect(effectiviness).toBe(0);
    });

    it("should return 1 on type any", async () => {
        const effectiviness = await checkEffectiveness("any", "grass");
        expect(effectiviness).toBe(1);
    });

    it("should return 1 if not related", async () => {
        const effectiviness = await checkEffectiveness("fire", "poison");
        expect(effectiviness).toBe(1);
    });

    it("should return 2 on type advantage", async () => {
        const effectiviness = await checkEffectiveness("fire", "grass");
        expect(effectiviness).toBe(2);
    });

    it("should return 0.5 on type half damage", async () => {
        const effectiviness = await checkEffectiveness("fire", "fire");
        expect(effectiviness).toBe(0.5);
    });
});

describe("Match", () => {
    it("should generate match", async () => {
        const match = await generateMatch();

        while (match.activePlayer.pokemon[0].hp.current > 0) {

            match.activePlayer.pokemon.filter(pokemon => pokemon.dice.activeFace !== "empty")
                .forEach(pokemon => pokemon.dice.togglePinned());
            match.activeTurn.reroll();
            match.activePlayer.pokemon.filter(pokemon => pokemon.dice.activeFace !== "empty")
                .forEach(pokemon => pokemon.dice.togglePinned());
            match.activeTurn.reroll();

            match.endReroll();

            await Promise.all(match.activePlayer.pokemon
                .filter(pokemon => isMove(pokemon.dice.activeFace))
                .map((pokemon) => match.toggleTarget(pokemon, match.oddPlayer.pokemon[0])));

            await match.endActions();

            match.newTurn();
        }

        console.log(match.turns.length);
    });
});
