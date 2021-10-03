import { Message, MessageEmbed } from "discord.js";
import { v4 as uuid } from "uuid";
import { useChannel } from "../discord";
import { generateNumber } from "../lib/utils";
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

const whatIsMyGrade = (number: number) => {
  if (number < 1) {
    return "E";
  } else if (number < 1.15) {
    return "D";
  } else if (number < 1.3) {
    return "C";
  } else if (number < 1.45) {
    return "B";
  } else if (number < 1.6) {
    return "A";
  } else {
    return "S";
  }
};

export async function lastPokemonRunAway() {
  if (!lastPokemon.pokemon) return false;

  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setDescription(`Oh no!! The ${lastPokemon.pokemon.name} run away!`);

  useChannel().send(message);

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

  let total = 0;
  let totalCopy = 0;
  const copy = {} as any;
  Object.keys(attributes).forEach((a) => {
    copy[a] = generateNumber(attributes[a]);
    total += attributes[a];
    totalCopy += copy[a];
  });

  const rank = totalCopy / total;

  const reply = new MessageEmbed()
    .setColor("#f39c12")
    .setDescription(
      `${m.author} caught a ${name}! Class ${whatIsMyGrade(rank)}!`
    );

  updateLastPokemon();

  await OwnedPokemon.create({
    number,
    name,
    user: m.author.id,
    original_user: m.author.id,
    attributes: copy,
    level: 0,
  });

  await Prestige.updateOne(
    { user: m.author.id, pokemon: number },
    { $inc: { value: 200 } }
  );

  m.channel.send(reply);
}
