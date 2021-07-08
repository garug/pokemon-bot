import { Client, DMChannel, MessageEmbed, TextChannel, User } from "discord.js";
import axios from "axios";

import Database from "./MongoDatabase";
import OwnedPokemon from "./OwnedPokemon";
import SetPokemon from "./SetPokemon";
import { generateNumber, randomFromInterval, randomPokemon } from "./lib/utils";
import Battle from "./Battle";
import Move from "./lib/moves";
import handleLastPokemon, {
  lastPokemonRunAway,
  updateLastPokemon,
  useLastPokemon,
} from "./messages/lastPokemon";
import { useChannel, useClient } from "./discord";
import handleDex from "./messages/dex";

const maxInterval = 20 * 60 * 1000;

const chanceInterval = 24 * 60 * 60 * 1000;

interface RoomBattle {
  p1?: {
    id: string;
    channel: DMChannel;
  };
  p2?: {
    id: string;
    channel: DMChannel;
  };
  battle?: Battle;
}

let activeBattle: RoomBattle = {};

async function verifyTeam(user: string) {
  const pokemon = await OwnedPokemon.find({ user });
  return pokemon.length >= 6;
}

async function notifyPlayers(message: MessageEmbed | string) {
  [activeBattle.p1?.channel, activeBattle.p2?.channel].forEach((channel) => {
    channel?.send(message);
  });
}

async function sendMovesToPlayers() {
  const generate = async (user: "p1" | "p2") => {
    const userString = activeBattle[user];

    if (userString) {
      const userDiscord = (await useClient()
        .users.cache.get(activeBattle[user]?.id || "")
        ?.fetch()) as User;

      const movesList = activeBattle.battle?.[
        user
      ].inBattle.originalPokemon.moves.map((e) => e.name);

      const moves = new MessageEmbed()
        .setColor("#f39c12")
        .setDescription(`Choose your move: ${movesList}`);

      userDiscord.send(moves);
    } else {
      throw Error("Player not found");
    }
  };

  generate("p1");
  generate("p2");
}

new Database().connect();

setInterval(async () => {
  const now = new Date().getTime();
  const timeDifference = now - useLastPokemon().date.getTime();
  const probability = timeDifference / maxInterval;
  console.log(timeDifference, probability);
  const test = probability > Math.random();

  if (!test || (await lastPokemonRunAway())) return;

  const possiblePokemon = await SetPokemon.aggregate([
    {
      $lookup: {
        from: "sets",
        localField: "set",
        foreignField: "_id",
        as: "set_p",
      },
    },
    {
      $match: {
        "set_p.active": true,
      },
    },
  ]);

  let total = 0;

  const probabilities = possiblePokemon.map((p) => {
    total += p.chance;
    return total;
  });

  const sortedNumber = Math.floor(Math.random() * (total - 1)) + 1;
  const sortedPokemon =
    possiblePokemon[probabilities.findIndex((n) => n > sortedNumber)];
  const pokemon = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${sortedPokemon.pokemon_number}/`
  );

  updateLastPokemon(pokemon.data);

  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setTitle("A wild pokemon appeared")
    // .setURL("https://discord.js.org/")
    // .setAuthor(
    //   "Some name",
    //   "https://i.imgur.com/wSTFkRM.png",
    //   "https://discord.js.org"
    // )
    .setDescription("Who's that pokemon?")
    // .setThumbnail("https://i.imgur.com/wSTFkRM.png")
    // .addFields(
    //   { name: "Regular field title", value: "Some value here" },
    //   { name: "\u200B", value: "\u200B" },
    //   { name: "Inline field title", value: "Some value here", inline: true },
    //   { name: "Inline field title", value: "Some value here", inline: true }
    // )
    // .addField("Inline field title", "Some value here", true)
    .setImage(pokemon.data.sprites.other["official-artwork"].front_default);
  // .setTimestamp()
  // .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");

  useChannel().send(message);
}, chanceInterval);

useClient().on("message", async (m) => {
  const message = m.content.toLowerCase();
  if (message === useLastPokemon().pokemon?.name.toLowerCase()) {
    handleLastPokemon(m);
  } else if (message === "dex") {
    handleDex(m);
  } else if (message.startsWith("!update")) {
    const uuid = message.slice("!update".length).trim();
    const pokemon = await OwnedPokemon.find();

    pokemon.forEach(async (p) => {
      const api = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${p?.name}/`
      );

      const attributes = api.data.stats.reduce((acc: any, s: any) => {
        if (s.stat.name === "special-attack") {
          acc.sp_attack = s.base_stat;
        } else if (s.stat.name === "special-defense") {
          acc.sp_defense = s.base_stat;
        } else {
          acc[s.stat.name] = s.base_stat;
        }
        return acc;
      }, {});

      const copy = {} as any;
      Object.keys(attributes).forEach(
        (a) => (copy[a] = generateNumber(attributes[a]))
      );

      if (p) {
        p.attributes = copy;
        p.number = api.data.id;
        p.level = 0;
        p.original_user ||= p.user;
        p.save().then((r) => console.log(r));
      }
    });
  } else if (message === "battle123") {
    if (!activeBattle.p1 && !activeBattle.p2) {
      const isVerified = await verifyTeam(m.author.id);
      let reply: MessageEmbed;
      if (isVerified) {
        activeBattle.p1 = {
          id: m.author.id,
          channel: m.channel as DMChannel,
        };
        reply = new MessageEmbed()
          .setColor("#f39c12")
          .setDescription(
            `${m.author.username} is waiting for battle! Type "battle!" to accept the challenge.`
          );
      } else {
        reply = new MessageEmbed()
          .setColor("#f39c12")
          .setDescription(
            `${m.author.username} you need at least 6 pokemon to battle.`
          );
      }
      m.channel.send(reply);
    } else if (!activeBattle.p2) {
      const isVerified = await verifyTeam(m.author.id);
      if (!isVerified) {
        const reply = new MessageEmbed()
          .setColor("#f39c12")
          .setDescription(
            `${m.author.username} you need at least 6 pokemon to battle.`
          );
        m.channel.send(reply);
      }
      activeBattle.p2 = {
        id: m.author.id,
        channel: m.channel as DMChannel,
      };
      if (!activeBattle.p1) console.error("error");
      else {
        activeBattle.battle = new Battle(
          {
            name: activeBattle.p1.id,
            pokemon: [
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
            ],
          },
          {
            name: activeBattle.p2.id,
            pokemon: [
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
              randomPokemon(),
            ],
          }
        );

        activeBattle.battle?.events.subscribe((event) => {
          const reply = new MessageEmbed()
            .setColor("#f39c12")
            .setDescription(event);
          m.channel.send(reply);
        });

        sendMovesToPlayers();
      }
    }
  } else if (
    (m.author.id === activeBattle.p1?.id ||
      m.author.id === activeBattle.p2?.id) &&
    message.startsWith("move")
  ) {
    if (activeBattle.battle) {
      const moveString = message.slice("move".length).trim();
      const player = activeBattle.p1?.id === m.author.id ? "p1" : "p2";
      const otherPlayer = player === "p1" ? "p2" : "p1";
      const move = activeBattle.battle?.[
        player
      ].inBattle.originalPokemon.moves.find(
        (move: Move) => (move.name = moveString)
      );
      if (move) {
        activeBattle.battle.registerAction(activeBattle.battle[player], move);
        if (activeBattle.battle?.currentTurn[otherPlayer]) {
          activeBattle.battle?.rollTurn();
          notifyPlayers("Rolou turno");
        } else {
          // TODO start counter
          m.author.send("Waiting for oponent");
        }
      } else {
        m.author.send("Your pokemon not learned this move.");
      }
    }
  }
});
