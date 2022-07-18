import {GeneratedEnergy, generateDice, isGeneratedEnergy, isMove} from "./dice";

describe("A dice should have...", () => {
    const dice = generateDice("charmander");

    test.concurrent("at least one energy", async () => {
        const commonEnergyValues = [1, 2];
        const energyTest = move => {
            const generatedEnergy = move as GeneratedEnergy;
            return isGeneratedEnergy(generatedEnergy) && commonEnergyValues.includes(generatedEnergy.value)
        }
        expect((await dice).moves.some(energyTest)).toBeTruthy();
    })

    test.concurrent("at least one move", async () => {
        expect((await dice).moves.some(move => isMove(move))).toBeTruthy();
    })
})
