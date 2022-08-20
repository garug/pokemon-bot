import { infoSort } from "./utils";
import { isEqual} from "lodash";

describe("sumarizedSort", () => {

    it("has correct probability", () => {
        const result = infoSort(["a", "a", "a", "b"]);

        if (result.sorted === "a")
            expect(result.chance).toBe(0.75);
        else {
            expect(result.sorted).toBe("b");
            expect(result.chance).toBe(0.25);
        }
    });

    it("has correct probability2", () => {
        const result = infoSort([{chance: 10}, {chance: 10}, {chance: 10}, {chance: 70}], e => e.chance);

        if (isEqual(result.sorted, {chance: 10}))
            expect(result.chance).toBe(0.3);
        else {
            expect(result.chance).toBe(0.7);
        }
    });
});