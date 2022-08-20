import { infoSort } from "./utils";

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
});