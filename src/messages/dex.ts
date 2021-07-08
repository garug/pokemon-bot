import { Message, MessageEmbed } from "discord.js";
import OwnedPokemon from "../OwnedPokemon";

export default async function handleDex(m: Message) {
  const ownedPokemon = await OwnedPokemon.find({ user: m.author.id });
  const uniquePokemon = [...new Set(ownedPokemon.map((p) => p.name))];
  const reply = new MessageEmbed().setColor("#f39c12").setDescription(
    `${m.author.username} dex: ${uniquePokemon.length}/151
        
        [Full dex](https://vigilant-villani-fedc91.netlify.app/#/usuarios/${m.author.id})`
  );
  m.channel.send(reply);
}
