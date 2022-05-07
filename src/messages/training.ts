import { Message } from "discord.js";
import { format, isBefore } from "date-fns";
import {
  applyTraining,
  availableTrainings,
  createTraining,
  MAX_ACTIVE_TRAININGS,
} from "../managers/training";
import OwnedPokemon from "../models/OwnedPokemon";
import Training from "../models/Trainings";

export async function handleTraining(m: Message) {
  if (m.channel.id !== "891998683082657803" && !process.env.DEVMODE) {
    return m.reply(
      `This command is only available in the <#891998683082657803> channel.`
    );
  }

  const [_, pokemon, time, p3] = m.content.split(" ");

  const activeTrainings = await Training.find({ user: m.author.id });

  // Repeat last training
  if (pokemon === "repeat") {
    const timeTraining = availableTrainings.find(
      (t) => t.hours === parseInt(time)
    );

    if (!timeTraining) {
      return m.reply(
        `Invalid time, please choose one of ${availableTrainings
          .map((t) => t.hours)
          .join(", ")} hours`
      );
    }

    activeTrainings.forEach(async (training) => {
      if (isBefore(training.finish_at, new Date())) {
        const p = await OwnedPokemon.findOne({ id: training.pokemon });
        if (p) {
          await applyTraining(p, training.mod);
          await createTraining(p.id, m.author.id, timeTraining);
        }
      }
    });
    return m.reply(`You have started training!`);
  }

  // Finish completed trainings
  if (pokemon === "finish") {
    activeTrainings.forEach(async (training) => {
      if (isBefore(training.finish_at, new Date())) {
        const p = await OwnedPokemon.findOne({ id: training.pokemon });
        if (p) await applyTraining(p, training.mod);
      }
    });
    return m.reply("Finished all trainings");
  }

  // Remove training
  if (time === "remove") {
    const training = activeTrainings.find((t) => t.pokemon === pokemon);
    if (!training) return m.reply("No active training found");
    await training.remove();
    return m.reply("Removed training");
  }

  // Only message
  if (!pokemon && !time) {
    const textTrainings = Array.from({ length: MAX_ACTIVE_TRAININGS })
      .map((_, i) => i)
      .filter((i) => activeTrainings[i])
      .map((i) => {
        const finished = isBefore(activeTrainings[i].finish_at, new Date());
        const finish_text = finished
          ? "✅ Finished"
          : `until ${format(activeTrainings[i].finish_at, "dd/MM - HH:mm")}`;
        return `- ${activeTrainings[i].pokemon} . ${finish_text}`;
      })
      .join(`,\n`);
    return m.reply(`Your active trainings:\n${textTrainings}`);
  }

  // New training
  const user = m.author.id;
  const pretended = await OwnedPokemon.findOne({ user, id: pokemon });

  if (!pretended) {
    return m.reply(`You don't have a pokemon with id ${pokemon}`);
  }

  if (activeTrainings.length >= MAX_ACTIVE_TRAININGS) {
    const msg = `You can't have more than ${MAX_ACTIVE_TRAININGS} trainings`;
    return m.reply(msg);
  }

  if (activeTrainings.some((t) => t.pokemon === pokemon)) {
    return m.reply(`You already have a training with this pokemon`);
  }

  const timeTraining = availableTrainings.find(
    (t) => t.hours === parseInt(time)
  );

  if (!timeTraining) {
    return m.reply(
      `Invalid time, please choose one of ${availableTrainings
        .map((t) => t.hours)
        .join(", ")} hours`
    );
  }

  try {
    createTraining(pokemon, m.author.id, timeTraining);
    return m.reply(`You have started training!`);
  } catch (e) {
    return m.reply(`${e}`);
  }
}
