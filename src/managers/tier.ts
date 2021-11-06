import OwnedPokemon from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";

export interface Tier {
  name: TierName;
  when: (value: number) => boolean;
  mod_pokemon: number;
  mod_trainer: number;
}

export type TierName = "SS" | "S" | "A" | "B" | "C" | "D" | "E" | "F";

export const availableTiers: Tier[] = [
  {
    name: "SS",
    when: (value) => value > 0 && value <= 0.01,
    mod_pokemon: 0.05,
    mod_trainer: 5,
  },
  {
    name: "S",
    when: (value) => value > 0.01 && value <= 0.03,
    mod_pokemon: 0.1,
    mod_trainer: 3,
  },
  {
    name: "A",
    when: (value) => value > 0.03 && value <= 0.1,
    mod_pokemon: 0.25,
    mod_trainer: 2,
  },
  {
    name: "B",
    when: (value) => value > 0.1 && value <= 0.2,
    mod_pokemon: 0.5,
    mod_trainer: 1.5,
  },
  {
    name: "C",
    when: (value) => value > 0.2 && value <= 0.4,
    mod_pokemon: 0.8,
    mod_trainer: 1.25,
  },
  {
    name: "D",
    when: (value) => value > 0.4 && value <= 0.65,
    mod_pokemon: 1,
    mod_trainer: 1,
  },
  {
    name: "E",
    when: (value) => value > 0.65 && value <= 0.875,
    mod_pokemon: 1.25,
    mod_trainer: 0.8,
  },
  {
    name: "F",
    when: (value) => value > 0.875,
    mod_pokemon: 1.5,
    mod_trainer: 0.5,
  },
];

const fnList = (list: any[], pList: any[]) => {
  if (list.length < pList.length) {
    return pList.map((_, i) => list[i]);
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

  while (state.minElements > list.length) {
    state.chuncks = state.chuncks.map((e) => e - 1 || 1);
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
