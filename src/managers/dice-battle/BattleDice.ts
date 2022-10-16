import { v4 } from "uuid";
import { Dice, DiceMoves, Face } from "../dice/dice";
import { Types } from "../dice/moves";

export class BattleDice implements Dice {
    moves: DiceMoves;

    types: [Types, Types?];

    id = v4();

    activeFace: Face = "empty";

    pinned = false;

    constructor(dice: Dice) {
        this.moves = dice.moves;
        this.types = dice.types;
    }

    togglePinned() {
        this.pinned = !this.pinned;
    }
}
