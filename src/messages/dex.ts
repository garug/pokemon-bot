import { Message, MessageEmbed } from "discord.js";
import useRepository from "../input/impl/PokemonRepositoryImpl";

export default async function handleDex(m: Message) {
  const p1 = useRepository().find({user: m.author.id}, { size: 6, page: 1});

  const p2 = useRepository().uniquePokemon(m.author.id);

  const [ ownedPokemon, uniquePokemon ] = await Promise.all([p1, p2]);

  const strongest = ownedPokemon.content.map((e) => e.name);
  const reply = new MessageEmbed().setColor("#f39c12").setDescription(
    `${m.author} dex: ${uniquePokemon}/493

    Strongest pokemon: ${strongest}
    
    Full dex: ${process.env.FRONTEND_URL}/usuarios/${m.author.id}`
  );
  m.channel.send({ embeds: [reply] });
}
