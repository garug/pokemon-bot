import axios from "axios";
import { Message } from "discord.js";
import InfoPokemon from "../models/InfoPokemon";

export default async function handleTier(m: Message) {
  const [_, p] = m.content.split(" ");

  let pokemon = parseInt(p);

  if (isNaN(pokemon)) {
    let pokeApi;
    try {
      pokeApi = await axios.get<any>(
        `https://pokeapi.co/api/v2/pokemon/${p}/`
      );
    } catch (e) {
      console.error(e);
      return m.reply("Error on your command");
    }

    if (!pokeApi.data.id) {
      return m.reply("You need to specify a valid pokemon.");
    } else {
      pokemon = pokeApi.data.id;
    }
  }

  const infoPokemon = await InfoPokemon.findOne({
    id_dex: pokemon,
  });

  if (!infoPokemon) {
    return m.reply("This pokemon is not ranked yet, wait to rank");
  }

  const tierString = infoPokemon.tiers
    .map((t) => `${t.name}. - ${t.value}\n`)
    .join("");

  return m.reply(`🏅 Tier List:\n${tierString}`);
}
