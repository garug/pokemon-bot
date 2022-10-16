import { v4 } from "uuid";
import { Attributes } from "@models/OwnedPokemon";
import { BattleDice } from "./BattleDice";
import { Move } from "../dice/moves";
import { checkEffectiveness } from "./Match";
import { PossibleConditions, ConditionName, availableConditions } from "./BattleCondition";
import { BattleEnergy } from "./BattlePlayer";
import { BehaviorSubject } from "rxjs";

export class BattlePokemon {

    id = v4();

    hp: {
        current: number;
        total: number;
    };

    conditions: PossibleConditions = {};

    targets: BattlePokemon[] = [];

    events = new BehaviorSubject({} as any);

    constructor(readonly dice: BattleDice, readonly attributes: Attributes) {
        this.hp = {
            current: attributes.hp,
            total: attributes.hp,
        };
    }

    get isDead() {
        return this.hp.current <= 0;
    }

    resetForTurn() {
        if (this.isDead) {
            this.dice.pinned = true;
            this.dice.activeFace = "empty";
        } else {
            this.dice.pinned = false;
        }
    }

    async useMove(energies: BattleEnergy): Promise<string | undefined> {
        if (this.conditions.sleep)
            return "sleep";

        if (this.conditions.paralyzed && Math.random() > 0.5)
            return "paralyzed";

        if (!this.useEnergy(energies))
            return "not-enough-energy";

        const move = this.dice.activeFace as Move;
        await Promise.all(this.targets.map(target => this.applyDamage(target)));
        this.targets.forEach(target => move.onHit?.(this, target));
        this.targets = [];
    }

    private useEnergy(energies: BattleEnergy): boolean {
        const move = this.dice.activeFace as Move;

        for (const energy of move.energy) {
            const identifier = energy.type === "any" ? Object.keys(energies)[0] : energy.type;
            const hasEnergy = energies[identifier] || 0 > energy.value;

            if (!hasEnergy)
                return false;

            energies[identifier]! -= energy.value;
        }

        return true;
    }

    applyCondition(name: ConditionName) {
        if (!this.conditions[name])
            this.conditions[name] = availableConditions[name]();
    }

    removeCondition(name: ConditionName) {
        delete this.conditions[name];
    }

    tickConditions() {
        Object.entries(this.conditions)
            .map(([key, value]) => value.tick || ((turns) => turns++))
            .forEach(tick => tick(this));
    }

    private async applyDamage(target: BattlePokemon) {
        if (target.isDead)
            return;

        const move = this.dice.activeFace as Move;
        const initialDamage = move.damage || 0;
        const finalDamage = move.modifyDamage?.(initialDamage) || initialDamage;

        if (finalDamage <= 0)
            return;

        const effectiviness = await checkEffectiveness(move.energy[0].type, target.dice.types[0], target.dice.types[1]);
        const damage = move.type === "physical" ?
                       this.attributes.attack / target.attributes.defense :
                       this.attributes.sp_attack / target.attributes.sp_defense;

        const finalValue = (finalDamage + damage) * effectiviness;

        target.events.next({
            id: "damage-taken",
            from: this.id,
            value: finalValue,
        });

        target.hp.current -= finalValue;
    }
}