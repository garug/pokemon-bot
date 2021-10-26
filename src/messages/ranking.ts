import { Message } from "discord.js";
import RankingTrainers from "../models/views/RankingTrainers";

export async function handleRanking(m: Message) {
  const [_, p] = m.content.split(" ");

  if (!p) {
    return m.reply("You need to specify a pokemon to get the ranking of.");
  }

  const pokemon = parseInt(p);
  if (pokemon === NaN) {
    return m.reply("You need to specify a valid pokemon.");
  }

  const [me, ranking] = await Promise.all([
    RankingTrainers.findOne({ pokemon, user: m.author.id }),
    RankingTrainers.find({ pokemon }).limit(3),
  ]);

  console.log(me, ranking);

  let meString;
  if (me) {
    meString = `You are ranked ${me.index} - ${me.value}`;
  } else {
    meString = "You haven't ranked this pokemon yet.";
  }

  const rankingString = ranking
    .map((r) => `${r.index}. <@${r.user}> - ${r.value}\n`)
    .join("");

  return m.reply(`Ranking:\n${rankingString}\n Your position: ${meString}`);
}
