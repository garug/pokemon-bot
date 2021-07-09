import { DMChannel, MessageEmbed, User } from "discord.js";
import axios from "axios";

import Database from "./MongoDatabase";
import OwnedPokemon from "./OwnedPokemon";
import SetPokemon from "./SetPokemon";
import { generateNumber, randomPokemon } from "./lib/utils";
import Battle, { Player } from "./Battle";
import Move, { moves } from "./lib/moves";
import handleLastPokemon, {
  lastPokemonRunAway,
  updateLastPokemon,
  useLastPokemon,
} from "./messages/lastPokemon";
import { useChannel, useClient } from "./discord";
import handleDex from "./messages/dex";
import Pokemon from "./Pokemon";

const maxInterval = 5 * 60 * 1000;

const chanceInterval = 1 * 60 * 1000;

interface RoomBattle {
  p1?: {
    user: User;
    channel: DMChannel;
  };
  p2?: {
    user: User;
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
        .users.cache.get(activeBattle[user]?.user.id || "")
        ?.fetch()) as User;

      const movesList = activeBattle.battle?.[
        user
      ].inBattle.originalPokemon.moves.map((e) => e.name);

      const pokemonList = activeBattle.battle?.[user].pokemon
        .filter((e) => e.hp > 0)
        .map((e) => e.originalPokemon.name);

      console.log(activeBattle.battle?.[user].pokemon);
      const moves = new MessageEmbed().setColor("#f39c12")
        .setDescription(`Choose your move: ${movesList}
        
        Or...
        
        Choose another pokemon: ${pokemonList}`);

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
    const pokemon = await OwnedPokemon.find({ "attributes.sp_defense": null });

    pokemon.forEach(async (p) => {
      const api = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${p?.name}/`
      );

      const attributes = api.data.stats.reduce((acc: any, s: any) => {
        if (s.stat.name === "special-defense") {
          acc.sp_defense = s.base_stat;
        }
        return acc;
      }, {});

      const copy = {} as any;
      Object.keys(attributes).forEach(
        (a) => (copy[a] = generateNumber(attributes[a]))
      );

      p.attributes.sp_defense = copy.sp_defense;
      p.save().then((r) => console.log(r));
    });
  } else if (message === "battle!65as4d6a5sd4654") {
    if (!activeBattle.p1 && !activeBattle.p2) {
      const isVerified = await verifyTeam(m.author.id);
      let reply: MessageEmbed;
      if (isVerified) {
        activeBattle.p1 = {
          user: m.author,
          channel: m.channel as DMChannel,
        };
        reply = new MessageEmbed()
          .setColor("#f39c12")
          .setDescription(
            `${m.author.username} is waiting to battle! Type "battle!" to accept the challenge.`
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
        user: m.author,
        channel: m.channel as DMChannel,
      };
      if (!activeBattle.p1) console.error("error");
      else {
        const [p1Pokemon, p2Pokemon] = await Promise.all([
          OwnedPokemon.find({ user: activeBattle.p1.user.id }).limit(6),
          OwnedPokemon.find({ user: activeBattle.p2.user.id }).limit(6),
        ]);

        const p1 = p1Pokemon.map((p) => {
          return new Pokemon({
            name: p.name,
            level: 1,
            attributes: p.attributes,
            moves,
            types: ["normal"],
          });
        }) as unknown as [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];
        const p2 = p2Pokemon.map((p) => {
          return new Pokemon({
            name: p.name,
            level: 1,
            attributes: p.attributes,
            moves,
            types: ["normal"],
          });
        }) as unknown as [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];

        activeBattle.battle = new Battle(
          {
            name: activeBattle.p1.user.id,
            pokemon: p1,
          },
          {
            name: activeBattle.p2.user.id,
            pokemon: p2,
          }
        );

        activeBattle.battle?.events.subscribe((event) => {
          if (event.id === "pokemonMove") {
            const me = event.value.player as "p1" | "p2";
            const adversary = event.value.player === "p1" ? "p2" : "p1";

            const myMessage = new MessageEmbed().setDescription(
              `You used ${event.value.move}!`
            );

            const messageToAdversary = new MessageEmbed().setDescription(
              `Your enemy used ${event.value.move}!`
            );

            activeBattle[me]?.channel.send(myMessage);
            activeBattle[adversary]?.channel.send(messageToAdversary);
          } else if (event.id === "changePokemon") {
            const me = event.value.player as "p1" | "p2";
            const adversary = event.value.player === "p1" ? "p2" : "p1";

            const myMessage = new MessageEmbed().setDescription(
              `You call ${event.value.out} back... Go ${event.value.in}!`
            );

            const messageToAdversary = new MessageEmbed().setDescription(
              `Your enemy call ${event.value.out} back and sent a ${event.value.in}!`
            );

            activeBattle[me]?.channel.send(myMessage);
            activeBattle[adversary]?.channel.send(messageToAdversary);
          } else if (event.id === "resultTurn") {
            const handleDefeat = (player: "p1" | "p2"): boolean => {
              const enemy = player === "p1" ? "p2" : "p1";
              const pokemonList =
                activeBattle.battle?.[player].pokemon
                  .filter((e) => e.hp > 0)
                  .map((e) => e.originalPokemon.name) || [];
              activeBattle[player]?.channel.send(
                "Your pokemon has been defeated!"
              );

              if (pokemonList.length > 0) {
                activeBattle[player]?.channel.send(
                  `Choose another pokemon: ${pokemonList}`
                );
                activeBattle[enemy]?.channel.send(
                  "Your oponnent has been defeated!"
                );
              } else {
                activeBattle[player]?.channel.send(`You lose!`);
                activeBattle[enemy]?.channel.send("You win!");
                activeBattle = {};
                return true;
              }
              return false;
            };

            if (event.value.defeats.p1) {
              if (handleDefeat("p1")) return;
            }

            if (event.value.defeats.p2) {
              if (handleDefeat("p2")) return;
            }

            const message = `${activeBattle.p1?.user} ${
              activeBattle.battle?.p1.inBattle.originalPokemon.name
            }: ${
              ((activeBattle.battle?.p1.inBattle.hp || 1) /
                (activeBattle.battle?.p1.inBattle.totalHp || 1)) *
              100
            }%
            
            ${activeBattle.p2?.user} ${
              activeBattle.battle?.p2.inBattle.originalPokemon.name
            }: ${
              ((activeBattle.battle?.p2.inBattle.hp || 1) /
                (activeBattle.battle?.p2.inBattle.totalHp || 1)) *
              100
            }%`;

            const reply = new MessageEmbed()
              .setDescription(message)
              .setColor("#f39c12");

            notifyPlayers(reply);
            sendMovesToPlayers();
          }
        });

        sendMovesToPlayers();
      }
    }
  } else if (
    (m.author.id === activeBattle.p1?.user.id ||
      m.author.id === activeBattle.p2?.user.id) &&
    message.startsWith("move")
  ) {
    if (activeBattle.battle) {
      const moveString = message.slice("move".length).trim();
      const player = activeBattle.p1?.user.id === m.author.id ? "p1" : "p2";
      const otherPlayer = player === "p1" ? "p2" : "p1";
      const move = activeBattle.battle?.[
        player
      ].inBattle.originalPokemon.moves.find(
        (move: Move) => move.name.toLowerCase() === moveString
      );
      if (move) {
        activeBattle.battle.registerAction(activeBattle.battle[player], move);
        if (activeBattle.battle?.currentTurn[otherPlayer]) {
          activeBattle.battle?.rollTurn();
        } else {
          // TODO start counter
          m.author.send("Waiting for oponent");
        }
      } else {
        m.author.send("Your pokemon didn't learn this move.");
      }
    }
  } else if (
    (m.author.id === activeBattle.p1?.user.id ||
      m.author.id === activeBattle.p2?.user.id) &&
    message.startsWith("change")
  ) {
    const changeString = message.slice("change".length).trim();
    const player = activeBattle.p1?.user.id === m.author.id ? "p1" : "p2";
    const activePlayer = activeBattle.battle?.[player] as Player;
    const otherPlayer = player === "p1" ? "p2" : "p1";
    const pokemon = activeBattle.battle?.[player].pokemon.find(
      (p) => p.originalPokemon.name === changeString
    );

    if (
      activeBattle.battle &&
      pokemon &&
      activeBattle.battle[player].inBattle.hp <= 0
    ) {
      activeBattle.battle[player].changeActivePokemon(pokemon);
      m.author.send(`You sent ${pokemon.originalPokemon.name}`);
      activeBattle[otherPlayer]?.channel.send(
        `Your oponnent sent a ${pokemon.originalPokemon.name}`
      );
      return;
    }

    if (pokemon && activeBattle[player]) {
      activeBattle.battle?.registerAction(activePlayer, pokemon);
      if (activeBattle.battle?.currentTurn[otherPlayer]) {
        activeBattle.battle?.rollTurn();
      } else {
        // TODO start counter
        m.author.send("Waiting for oponent");
      }
    } else {
      m.author.send("You don't have this pokemon.");
    }
  }
});
