import { sort } from "../../lib/utils";
import { BattlePlayer } from "./BattlePlayer";
import { BehaviorSubject } from "rxjs";

export type TurnPhase = "rerolling" | "choosing" | "resolving" | "ending";

export class BattleTurn {

    rerolls = 2;

    outcomeOrder: string[] = [];

    phase: TurnPhase;

    events = new BehaviorSubject({} as any);

    constructor(readonly player: BattlePlayer, readonly incomingOrder: string[]) {
        this.player.pokemon.forEach(p => p.resetForTurn());
        this.phase = "rerolling";
        this.rollDices();
    }

    reroll() {
        if (this.rerolls-- > 0) {
            this.rollDices();
        } else
            throw new Error("no more rerolls");
    }

    private rollDices() {
        this.player.pokemon
            .map(p => p.dice)
            .filter(d => !d.pinned)
            .forEach(d => d.activeFace = sort(d.moves));

        this.events.next({
            id: "rerolled",
            pokemon: this.player.pokemon.map(p => p.dice.activeFace),
        })
    }
}
