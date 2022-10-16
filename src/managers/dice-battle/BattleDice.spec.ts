import { BattleDice } from "./BattleDice";
import { generateDice } from "./utils";

describe("BattleDice", () => {

    it("should have pinned value false by default", () => {
        const dice = generateDice();
        expect(dice.pinned).toBe(false);
    })

    describe(".toggleDice", () => {

        it("should set false when pinned is true", () => {
            const dice = generateDice();
            dice.pinned = false;
            dice.togglePinned();
            expect(dice.pinned).toBe(true);
        });

        it("should set true when pinned is false", () => {
            const dice = generateDice();
            dice.pinned = true;
            dice.togglePinned();
            expect(dice.pinned).toBe(false);
        })
    });
});
