import { Client, DMChannel, MessageEmbed, TextChannel, User } from "discord.js";
import axios from "axios";
import { v4 as uuid } from "uuid";

import Database from "./MongoDatabase";
import OwnedPokemon from "./OwnedPokemon";
import SetPokemon from "./SetPokemon";
import { randomFromInterval, randomPokemon } from "./lib/utils";
import Battle from "./Battle";
import Move from "./lib/moves";

const client = new Client();

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

function useChannel() {
  return client.channels.cache.get("855838535503970344") as TextChannel;
}

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
      const userDiscord = (await client.users.cache
        .get(activeBattle[user]?.id || "")
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

let lastPokemon = {
  date: new Date(),
  pokemon: undefined as any,
};

function updateLastPokemon(pokemon?: any) {
  lastPokemon = {
    date: new Date(),
    pokemon,
  };
}

async function lastPokemonRunAway() {
  if (!lastPokemon.pokemon) return false;

  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setDescription(`Oh no!! The ${lastPokemon.pokemon.name} run away!`);

  useChannel().send(message);

  updateLastPokemon();

  return true;
}

const generateNumber = (number: number) => {
  const chance = Math.random();
  if (chance < 0.7) {
    return number * randomFromInterval(0.8, 1.25);
  } else if (chance < 0.9) {
    return number * randomFromInterval(1.25, 1.4);
  } else if (chance < 0.95) {
    return number * randomFromInterval(1.4, 1.65);
  } else if (chance < 0.98) {
    return number * randomFromInterval(1.75, 2);
  } else {
    return number * 3;
  }
};

const whatIsMyGrade = (number: number) => {
  if (number < 1) {
    return "E";
  } else if (number < 1.15) {
    return "D";
  } else if (number < 1.3) {
    return "C";
  } else if (number < 1.45) {
    return "B";
  } else if (number < 1.6) {
    return "A";
  } else {
    return "S";
  }
};

setInterval(async () => {
  const now = new Date().getTime();
  const timeDifference = now - lastPokemon.date.getTime();
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

client.on("message", async (m) => {
  const message = m.content.toLowerCase();
  if (message === lastPokemon.pokemon?.name.toLowerCase()) {
    const name = lastPokemon.pokemon.name;
    const number = lastPokemon.pokemon.id;

    const attributes = lastPokemon.pokemon.stats.reduce((acc: any, s: any) => {
      if (s.stat.name === "special-attack") {
        acc.sp_attack = s.base_stat;
      } else if (s.stat.name === "specia l-defense") {
        acc.sp_defense = s.base_stat;
      } else {
        acc[s.stat.name] = s.base_stat;
      }
      return acc;
    }, {});

    attributes.reflex =
      (attributes.attack + attributes.defense + attributes.speed) / 3;

    let total = 0;
    let totalCopy = 0;
    const copy = {} as any;
    Object.keys(attributes).forEach((a) => {
      copy[a] = generateNumber(attributes[a]);
      total += attributes[a];
      totalCopy += copy[a];
    });

    const rank = totalCopy / total;

    console.log(`ranks: ${totalCopy} / ${total}`);

    const reply = new MessageEmbed()
      .setColor("#f39c12")
      .setDescription(
        `${m.author.username} caught a ${name}! Class ${whatIsMyGrade(rank)}!`
      );

    updateLastPokemon();

    await OwnedPokemon.create({
      id: uuid(),
      number,
      name,
      user: m.author.id,
      original_user: m.author.id,
      attributes: copy,
      level: 0,
    });

    m.channel.send(reply);
  } else if (message === "dex") {
    const ownedPokemon = await OwnedPokemon.find({ user: m.author.id });
    const uniquePokemon = [...new Set(ownedPokemon.map((p) => p.name))];
    const reply = new MessageEmbed().setColor("#f39c12").setDescription(
      `${m.author.username} dex: ${uniquePokemon.length}/151
        
        [Full dex](https://vigilant-villani-fedc91.netlify.app/#/usuarios/${m.author.id})`
    );
    m.channel.send(reply);
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

client.login(process.env.DISCORD_TOKEN);
