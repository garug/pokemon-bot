import InfoPokemon from "../models/InfoPokemon";
import OwnedPokemon from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";
import MoreStrongPokemon from "../models/views/MoreStrongPokemon";

export interface Tier {
  name: TierName;
  value: number;
  when: (value: number) => boolean;
  mod_pokemon: number;
  mod_trainer: number;
}

export type TierName = "SS" | "S" | "A" | "B" | "C" | "D" | "E" | "F";

export const availableTiers: Tier[] = [
  {
    name: "SS",
    value: 0.01,
    when: (value) => value > 0 && value <= 0.01,
    mod_pokemon: 0.05,
    mod_trainer: 5,
  },
  {
    name: "S",
    value: 0.02,
    when: (value) => value > 0.01 && value <= 0.03,
    mod_pokemon: 0.1,
    mod_trainer: 3,
  },
  {
    name: "A",
    value: 0.07,
    when: (value) => value > 0.03 && value <= 0.1,
    mod_pokemon: 0.25,
    mod_trainer: 2,
  },
  {
    name: "B",
    value: 0.1,
    when: (value) => value > 0.1 && value <= 0.2,
    mod_pokemon: 0.5,
    mod_trainer: 1.5,
  },
  {
    name: "C",
    value: 0.2,
    when: (value) => value > 0.2 && value <= 0.4,
    mod_pokemon: 0.8,
    mod_trainer: 1.25,
  },
  {
    name: "D",
    value: 0.25,
    when: (value) => value > 0.4 && value <= 0.65,
    mod_pokemon: 1,
    mod_trainer: 1,
  },
  {
    name: "E",
    value: 0.225,
    when: (value) => value > 0.65 && value <= 0.875,
    mod_pokemon: 1.25,
    mod_trainer: 0.8,
  },
  {
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

export async function updatePokemon() {
  const allPoke = await MoreStrongPokemon.aggregate([
    {
      $group: {
        _id: "$number",
        name: {
          $first: "$name",
        },
        arr: {
          $push: {
            total: "$total",
          },
        },
      },
    },
  ]);

  const updates = allPoke.map((p) => {
    const fn = fnList(
      p.arr,
      availableTiers.map((t) => t.value)
    );

    const tiers = availableTiers
      .filter((_, index) => fn[index])
      .map((t, index) => ({
        order: index,
        tier: t.name,
        value: fn[index][fn[index].length - 1].total,
      }));

    return InfoPokemon.updateOne(
      {
        number: p._id,
      },
      {
        $set: {
          tiers,
        },
      },
      { upsert: true }
    );
  });

  await Promise.all(updates);
}
