import axios from "axios";
import { OwnedPokemon } from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";
import Training from "../models/Trainings";

export interface TrainingTiming {
  hours: number;
  mod: number;
}

export const availableTrainings: TrainingTiming[] = [
  { hours: 3, mod: 0.25 }, // 3,75
  { hours: 8, mod: 0.43 }, // 3.225
  { hours: 12, mod: 0.726 }, // 2.7225
  { hours: 24, mod: 1.2 }, // 2.25
];

export const MAX_ACTIVE_TRAININGS = 3;

export async function createTraining(
  pokemon: string,
  user: string,
  training: TrainingTiming
) {
  const activeTrainings = await Training.find({
    user,
  });

  if (activeTrainings.length >= MAX_ACTIVE_TRAININGS) {
    throw new Error(
      `You can't have more than ${MAX_ACTIVE_TRAININGS} active trainings`
    );
  }

  const pokemonTraining = await Training.findOne({
    pokemon,
  });

  if (pokemonTraining) {
    throw new Error(`This pokemon is already being trained`);
  }

  return await Training.create({
    user,
    pokemon,
    mod: training.mod,
    finish_at: Date.now() + training.hours * 3600000,
  });
}

export async function applyTraining(pokemon: OwnedPokemon, mod: number) {
  const defaultPokemon = await axios.get<any>(
    `https://pokeapi.co/api/v2/pokemon/${pokemon.number}/`
  );
  const modTrainer = 1.5;
  const modPokemon = 0.5;

  function getStats(name: string) {
    return defaultPokemon.data.stats.find((s: any) => s.stat.name === name)
      .base_stat;
  }

  function applyValue(value: number) {
    return ((value / 2) * modTrainer * modPokemon * mod) / 100;
  }

  const computedTraining = {
    user: pokemon.user,
    created_at: new Date(),
    mod,
    attributes: {
      hp: applyValue(getStats("hp") + pokemon.attributes.hp),
      attack: applyValue(getStats("attack") + pokemon.attributes.attack),
      defense: applyValue(getStats("defense") + pokemon.attributes.defense),
      sp_attack: applyValue(
        getStats("special-attack") + pokemon.attributes.sp_attack
      ),
      sp_defense: applyValue(
        getStats("special-defense") + pokemon.attributes.sp_defense
      ),
      speed: applyValue(getStats("speed") + pokemon.attributes.speed),
    },
  };

  pokemon.trainings.push(computedTraining);

  await Promise.all([
    pokemon.save(),
    Training.deleteOne({ pokemon: pokemon.id }),
    await Prestige.updateOne(
      { user: pokemon.user, pokemon: pokemon.number },
      { $inc: { value: 100 * modPokemon + 100 * mod } },
      { upsert: true }
    ),
  ]);

  return computedTraining;
}
