import InfoPokemon from "../models/InfoPokemon";
import OwnedPokemon, {
  OwnedPokemon as TypeOwnedPokemon,
} from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";
import useRepository from "../input/impl/PokemonRepositoryImpl";

export interface BasicTier {
  order: number;
  name: string;
  value: number;
}
export interface Tier extends BasicTier {
  when: (value: number) => boolean;
  mod_pokemon: number;
  mod_trainer: number;
}

export type TierName = "SS" | "S" | "A" | "B" | "C" | "D" | "E" | "F";

export const availableTiers: Tier[] = [
  {
    order: 0,
    name: "SS",
    value: 0.01,
    when: (value) => value >= 0 && value <= 0.01,
    mod_pokemon: 0.05,
    mod_trainer: 5,
  },
  {
    order: 1,
    name: "S",
    value: 0.02,
    when: (value) => value > 0.01 && value <= 0.03,
    mod_pokemon: 0.1,
    mod_trainer: 3,
  },
  {
    order: 2,
    name: "A",
    value: 0.07,
    when: (value) => value > 0.03 && value <= 0.1,
    mod_pokemon: 0.25,
    mod_trainer: 2,
  },
  {
    order: 3,
    name: "B",
    value: 0.1,
    when: (value) => value > 0.1 && value <= 0.2,
    mod_pokemon: 0.5,
    mod_trainer: 1.5,
  },
  {
    order: 4,
    name: "C",
    value: 0.2,
    when: (value) => value > 0.2 && value <= 0.4,
    mod_pokemon: 0.8,
    mod_trainer: 1.25,
  },
  {
    order: 5,
    name: "D",
    value: 0.25,
    when: (value) => value > 0.4 && value <= 0.65,
    mod_pokemon: 1,
    mod_trainer: 1,
  },
  {
    order: 6,
    name: "E",
    value: 0.225,
    when: (value) => value > 0.65 && value <= 0.875,
    mod_pokemon: 1.25,
    mod_trainer: 0.8,
  },
  {
    order: 7,
    name: "F",
    value: 0.125,
    when: (value) => value > 0.875,
    mod_pokemon: 1.5,
    mod_trainer: 0.5,
  },
];

export const fnList = (list: any[], pList: any[]) => {
  if (list.length < pList.length) {
    return pList.filter((_, i) => list[i]).map((_, i) => [list[i]]);
  }

  const state = {
    chuncks: pList.map((pItem) => Math.max(1, Math.round(list.length * pItem))),
    get minElements() {
      return this.chuncks.reduce((a, acc) => a + acc, 0);
    },
    get payback() {
      let localIndex = 0;
      return this.chuncks.map((chunck) =>
        list.slice(localIndex, (localIndex += chunck))
      );
    },
  };

  let pointer = 0;
  while (state.minElements > list.length) {
    if (state.chuncks[pointer] - 1 >= 1) {
      state.chuncks[pointer]--;
    }

    if (pointer === state.chuncks.length - 1) {
      pointer = 0;
    } else {
      pointer++;
    }
  }

  return state.payback;
};

export async function updateTrainers() {
  const initialPrestige = await OwnedPokemon.aggregate([
    {
      $group: {
        _id: {
          user: "$original_user",
          pokemon: "$number",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        value: {
          $multiply: ["$count", 200],
        },
        user: "$_id.user",
        pokemon: "$_id.pokemon",
      },
    },
  ]);

  const savedPrestige = initialPrestige.map((p) => {
    return {
      value: p.value,
      user: p.user,
      pokemon: p.pokemon,
    };
  });

  await Prestige.insertMany(savedPrestige);

  // const saved = await Prestige.find();
  // const allPokemon = await InfoPokemon.find();

  // allPokemon.forEach((info) => {
  //   const savedOf = saved.filter((s) => s.pokemon === info.number);
  //   console.log(savedOf);
  // });
}

export async function findMyTier(pokemon: TypeOwnedPokemon): Promise<Tier> {
  const infoPokemon = await InfoPokemon.findOne({
    id_dex: pokemon.id_dex,
  });

  const valid =
    infoPokemon && infoPokemon.tiers.find((t) => pokemon.total >= t.value);

  if (valid) {
    const tier = availableTiers.find((t) => t.name === valid.name);

    if (!tier) throw new Error("Tier not found of valid info");

    return tier;
  } else if (!infoPokemon) {
    return availableTiers[0];
  } else if (infoPokemon.tiers.length - 1 >= 0) {
    return availableTiers[infoPokemon.tiers.length - 1];
  } else {
    return availableTiers[0];
  }
}
