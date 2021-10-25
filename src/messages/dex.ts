import { Message, MessageEmbed } from "discord.js";
import MoreStrongPokemon from "../models/MoreStrongPokemon";

export default async function handleDex(m: Message) {
  const ownedPokemon = await MoreStrongPokemon.find({
    user: m.author.id,
  }).sort({ total: -1 });
  const uniquePokemon = [...new Set(ownedPokemon.map((p) => p.name))];
  const strongest = [...ownedPokemon].splice(0, 6).map((e) => e.name);
  const reply = new MessageEmbed().setColor("#f39c12").setDescription(
    `${m.author} dex: ${uniquePokemon.length}/493

    Strongest pokemon: ${strongest}
    
    Full dex: ${process.env.FRONTEND_URL}/usuarios/${m.author.id}`
  );
  m.channel.send({ embeds: [reply] });
}
