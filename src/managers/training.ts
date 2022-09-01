import axios from "axios";
import InfoPokemon from "../models/InfoPokemon";
import { OwnedPokemon } from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";
import Training from "../models/Trainings";
import RankingTrainers from "../models/views/RankingTrainers";
import { availableTiers, findMyTier } from "./tier";

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
    `https://pokeapi.co/api/v2/pokemon/${pokemon.id_dex}/`
  );

  const countTrainers = RankingTrainers.count({
    pokemon: pokemon.id_dex,
  });

  const findMe = RankingTrainers.findOne({
    user: pokemon.user,
    pokemon: pokemon.id_dex,
  });

  const [total, me] = await Promise.all([countTrainers, findMe]);

  const tierTrainer =
    availableTiers.find((t) => me && t.when((me.index - 1) / total)) ||
    availableTiers[availableTiers.length - 1];

  const tierPokemon =
    (await findMyTier(pokemon)) || availableTiers[availableTiers.length - 1];

  function getStats(name: string) {
    return defaultPokemon.data.stats.find((s: any) => s.stat.name === name)
      .base_stat;
  }

  function applyValue(value: number) {
    const modTrainer = tierTrainer.mod_trainer;
    const modPokemon = tierPokemon.mod_pokemon;

    return ((value) * modTrainer * modPokemon * mod) / 100;
  }


  const computedTraining = {
    user: pokemon.user,
    created_at: new Date(),
    mod,
    attributes: {
      hp: applyValue(100),
      attack: applyValue(100),
      defense: applyValue(100),
      sp_attack: applyValue(100),
      sp_defense: applyValue(100),
      speed: applyValue(100),
    },
  };

  pokemon.trainings.push(computedTraining);

  await Promise.all([
    pokemon.save(),
    Training.deleteOne({ pokemon: pokemon.id }),
    await Prestige.updateOne(
      { user: pokemon.user, id_dex: pokemon.id_dex },
      { $inc: { value: 100 * tierPokemon.mod_pokemon + 100 * mod } },
      { upsert: true }
    ),
  ]);

  return computedTraining;
}
