import Pokemon from "../Pokemon";
import { moves } from "./moves";

export function randomFromInterval(min: number, max: number) {
  return (
    Math.floor(Math.random() * (max * 100 - min * 100 + 1) + min * 100) / 100
  );
}

export function randomPokemon() {
  return new Pokemon({
    name: `abc${randomFromInterval(1, 1000)}`,
    level: 1,
    attributes: {
      hp: 50,
      attack: 50,
      defense: 50,
      sp_attack: 50,
      sp_defense: 50,
      speed: 50,
    },
    moves,
    types: ["normal"],
  });
}

export function generateNumber(number: number) {
  const chance = Math.random();
  if (chance < 0.7) {
    return number * randomFromInterval(0.8, 1.25);
  } else if (chance < 0.9) {
    return number * randomFromInterval(1.25, 1.4);
  } else if (chance < 0.95) {
    return number * randomFromInterval(1.4, 1.65);
  } else if (chance < 0.99) {
    return number * randomFromInterval(1.75, 2);
  } else {
    return number * 3;
  }
}
