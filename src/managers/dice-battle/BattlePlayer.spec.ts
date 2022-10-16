import { BattlePlayer } from "./BattlePlayer";
import { generatePlayer } from "./utils";

describe("BattlePlayer", () => {

    it("should have empty energies by default", async () => {
        const player = await generatePlayer();
        expect(player.energies).toStrictEqual({});
    });
});
