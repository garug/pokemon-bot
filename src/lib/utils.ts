import { random, isEqual } from "lodash";

export function generateNumber(number: number) {
    const chance = Math.random();
    if (chance < 0.7) {
        return number * random(0.8, 1.25);
    } else if (chance < 0.9) {
        return number * random(1.25, 1.4);
    } else if (chance < 0.95) {
        return number * random(1.4, 1.65);
    } else if (chance < 0.99) {
        return number * random(1.75, 2);
    } else {
        return number * 3;
    }
}

interface InfoSorted<T> {
    sorted: T;
    chance: number;
}

export function infoSort<Type>(possibities: Type[], mapToPossibility: (param: Type) => number = () => 1): InfoSorted<Type> {
    let total = 0;

    const usedPossibilities = possibities
        .map(mapToPossibility)
        .map(n => {
            total += n;
            return total;
        });

    const randonizedNumber = random(1, total);

    const index = usedPossibilities.findIndex((n) => n >= randonizedNumber);

    const sorted = possibities[index];

    return {
        sorted,
        chance: possibities.filter(e => isEqual(e, sorted)).map(mapToPossibility).reduce((acc, e) => acc + e) / total,
    }
}

export function sort<Type>(possibities: Type[], mapToPossibility: (param: Type) => number = () => 1): Type {
    const { sorted } = infoSort(possibities, mapToPossibility);
    return sorted;
}
