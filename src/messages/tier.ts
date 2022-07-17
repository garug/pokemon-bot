import axios from "axios";
import { Message } from "discord.js";
import InfoPokemon from "../models/InfoPokemon";

export default async function handleTier(m: Message) {
  const [_, p] = m.content.split(" ");

  let pokemon = parseInt(p);

  if (isNaN(pokemon)) {
    const pokeApi = await axios.get<any>(
      `https://pokeapi.co/api/v2/pokemon/${p}/`
    );

    if (!pokeApi.data.id) {
      return m.reply("You need to specify a valid pokemon.");
    } else {
      pokemon = pokeApi.data.id;
    }
  }

  const infoPokemon = await InfoPokemon.findOne({
    number: pokemon,
  });

  if (!infoPokemon) {
    return m.reply("This pokemon is not ranked yet, wait to rank");
  }

  const tierString = infoPokemon.tiers
    .map((t) => `${t.name}. - ${t.value}\n`)
    .join("");

  return m.reply(`🏅 Tier List:\n${tierString}`);
}
