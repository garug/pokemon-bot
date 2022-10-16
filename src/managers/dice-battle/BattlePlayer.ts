import { BattlePokemon } from "./BattlePokemon";
import { Types } from "../dice/moves";

export class BattlePlayer {

    energies: BattleEnergy;

    /**
     *
     * @param id id of trainer, usually discord id
     * @param pokemon
     */
    constructor(readonly id: string, readonly pokemon: BattlePokemon[]) {
        this.energies = {};
    }
}

export type BattleEnergy = {
    [key in Types]?: number;
};
