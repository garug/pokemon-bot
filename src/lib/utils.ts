import Pokemon from "../Pokemon";
import { moves } from "./moves";

export function randomFromInterval(min: number, max: number) {
  return (
    Math.floor(Math.random() * (max * 100 - min * 100 + 1) + min * 100) / 100
  );
}

export function randomPokemon() {
  return new Pokemon({
    name: "abc",
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
