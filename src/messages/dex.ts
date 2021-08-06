import { Message, MessageEmbed } from "discord.js";
import OwnedPokemon from "../models/OwnedPokemon";

export default async function handleDex(m: Message) {
  const ownedPokemon = await OwnedPokemon.aggregate([
    {
      $addFields: {
        total: {
          $add: [
            "$attributes.attack",
            "$attributes.defense",
            "$attributes.hp",
            "$attributes.sp_attack",
            "$attributes.sp_defense",
            "$attributes.speed",
          ],
        },
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
    {
      $match: {
        user: m.author.id,
      },
    },
  ]);
  const uniquePokemon = [...new Set(ownedPokemon.map((p) => p.name))];
  const strongest = [...ownedPokemon].splice(0, 6).map((e) => e.name);
  const reply = new MessageEmbed().setColor("#f39c12").setDescription(
    `${m.author} dex: ${uniquePokemon.length}/251

    Strongest pokemon: ${strongest}
    
    Full dex: ${process.env.FRONTEND_URL}/usuarios/${m.author.id}`
  );
  // [Full dex](https://vigilant-villani-fedc91.netlify.app/#/usuarios/${m.author.id})
  m.channel.send(reply);
}
