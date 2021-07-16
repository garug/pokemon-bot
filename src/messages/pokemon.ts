import { Message } from "discord.js";
import OwnedPokemon from "../models/OwnedPokemon";

export async function mark(m: Message) {
  const [_, intend] = m.content.split(" ");

  let pokemon;

  if (intend === "latest") {
    pokemon = await OwnedPokemon.findOne({ user: m.author.id }).sort({
      created_at: -1,
    });
  } else {
    pokemon = await OwnedPokemon.findOne({ id: intend, user: m.author.id });
  }

  if (pokemon) {
    pokemon.marks.tradable = true;
    pokemon.save();
    console.log(pokemon);
    m.channel.send(`Pokemon "${pokemon.id}" is available for trade.`);
  } else {
    m.channel.send(`${m.author} something wrong in your command...`);
  }
}

export async function unmark(m: Message) {
  const [_, intend] = m.content.split(" ");

  let pokemon;

  pokemon = await OwnedPokemon.findOne({ id: intend, user: m.author.id });

  if (pokemon) {
    pokemon.marks.tradable = false;
    pokemon.save();
    // TODO remove all offers
    m.channel.send(`Pokemon #${pokemon.id} is no longer available for trade.`);
  } else {
    m.channel.send(`${m.author} something wrong in your command...`);
  }
}
