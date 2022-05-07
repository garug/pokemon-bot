import { Message, MessageEmbed } from "discord.js";
import { useChannel } from "../discord";
import { generateNumber } from "../lib/utils";
import { findMyTier } from "../managers/tier";
import OwnedPokemon from "../models/OwnedPokemon";
import Prestige from "../models/Prestige";

let lastPokemon = {
  date: new Date(),
  pokemon: undefined as any,
};

export function useLastPokemon() {
  return lastPokemon;
}

export function updateLastPokemon(pokemon?: any) {
  lastPokemon = {
    date: new Date(),
    pokemon,
  };
}

export async function lastPokemonRunAway() {
  if (!lastPokemon.pokemon) return false;

  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setDescription(`Oh no!! The ${lastPokemon.pokemon.name} run away!`);

  useChannel().send({ embeds: [message] });

  updateLastPokemon();

  return true;
}

export default async function handleLastPokemon(m: Message) {
  const name = lastPokemon.pokemon.name;
  const number = lastPokemon.pokemon.id;

  const attributes = lastPokemon.pokemon.stats.reduce((acc: any, s: any) => {
    if (s.stat.name === "special-attack") {
      acc.sp_attack = s.base_stat;
    } else if (s.stat.name === "special-defense") {
      acc.sp_defense = s.base_stat;
    } else {
      acc[s.stat.name] = s.base_stat;
    }
    return acc;
  }, {});

  const copy = {} as any;
  Object.keys(attributes).forEach((a) => {
    copy[a] = generateNumber(attributes[a]);
  });

  updateLastPokemon();

  const createdPokemon = await OwnedPokemon.create({
    number,
    name,
    user: m.author.id,
    original_user: m.author.id,
    attributes: copy,
    level: 0,
    marks: {
      shiny: lastPokemon.pokemon.shiny,
    }
  });

  await Prestige.updateOne(
    { user: m.author.id, pokemon: number },
    { $inc: { value: 200 } },
    { upsert: true }
  );

  const rank = (await findMyTier(createdPokemon)).name;

  const reply = new MessageEmbed()
    .setColor("#f39c12")
    .setDescription(`${m.author} caught a ${(createdPokemon.marks.shiny && '✨')} ${name}! Class ${rank}!`);

  m.channel.send({ embeds: [reply] });
}
