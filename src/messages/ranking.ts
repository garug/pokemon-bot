import axios from "axios";
import { Message } from "discord.js";
import RankingTrainers from "../models/views/RankingTrainers";

export async function handleRanking(m: Message) {
  const [_, p] = m.content.split(" ");

  if (m.channel.id !== "891998683082657803" && !process.env.DEVMODE) {
    return m.reply(
      `This command is only available in the <#891998683082657803> channel.`
    );
  }

  if (!p) {
    return m.reply("You need to specify a pokemon to get the ranking of.");
  }

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

  const [me, ranking] = await Promise.all([
    RankingTrainers.findOne({ pokemon, user: m.author.id }),
    RankingTrainers.find({ pokemon }).limit(3),
  ]);

  let meString;
  if (me) {
    meString = `You are ranked ${me.index} - ${me.value}`;
  } else {
    meString = "You haven't ranked this pokemon yet.";
  }

  const rankingString = ranking
    .map((r) => `${useMedal(r.index)} <@${r.user}> - ${r.value.toFixed(1)}\n`)
    .join("");

  return m.reply(`🏆 Ranking:\n${rankingString}\n Your position: ${meString}`);
}

function useMedal(position: number) {
  switch (position) {
    case 1:
      return "🥇"
    case 2:
      return "🥈"
    case 3:
      return "🥉"
    default:
      return "🏅"
  }
}
