import { BattleTurn } from "./BattleTurn";
import { generateTurn } from "./utils";

describe("BattleTurn", () => {

    it("should have two rerolls", async ()=> {
        const turn = await generateTurn();
        turn.reroll();
        turn.reroll();
        expect(() => turn.reroll()).toThrow("no more rerolls");
    })
})
