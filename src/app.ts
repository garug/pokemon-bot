import { DMChannel, Invite, MessageEmbed, User } from "discord.js";
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
import useSocket from "./socket";
import { v4 as uuid } from "uuid";
import express, { json } from "express";
import cors from "cors";

const app = express();

const port = process.env.PORT || 8081;

const server = app
  .use(cors())
  .use(json())
  .listen(port, () => console.log(`Server online on port ${port}`));

useSocket(server);

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const pokemon = await OwnedPokemon.find(
    { user: id },
    "-_id name id created_at"
  );
  return res.json({ pokemon });
});

const maxInterval = 10 * 60 * 1000;

const chanceInterval = 1 * 60 * 1000;

class InviteBattle {
  id: string;
  created_at: Date;
  challenger: User;
  challenged: User;

  constructor(challenger: User, challenged: User) {
    this.id = uuid();
    this.created_at = new Date();
    this.challenger = challenger;
    this.challenged = challenged;
  }
}

const currentInvites: InviteBattle[] = [];

export const activeBattles: Battle[] = [];

async function verifyTeam(user: string) {
  const pokemon = await OwnedPokemon.find({ user });
  return pokemon.length >= 6;
}

// async function notifyPlayers(message: MessageEmbed | string) {
//   [activeBattle.p1?.user, activeBattle.p2?.user].forEach((channel) => {
//     channel?.send(message);
//   });
// }

new Database().connect();

setInterval(async () => {
  const now = new Date().getTime();
  const timeDifference = now - useLastPokemon().date.getTime();
  const probability = timeDifference / maxInterval;
  // console.log(timeDifference, probability);
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
    // const uuid = message.slice("!update".length).trim();
    // const pokemon = await OwnedPokemon.find({ "attributes.sp_defense": null });
    // pokemon.forEach(async (p) => {
    //   const api = await axios.get(
    //     `https://pokeapi.co/api/v2/pokemon/${p?.name}/`
    //   );
    //   const attributes = api.data.stats.reduce((acc: any, s: any) => {
    //     if (s.stat.name === "special-defense") {
    //       acc.sp_defense = s.base_stat;
    //     }
    //     return acc;
    //   }, {});
    //   const copy = {} as any;
    //   Object.keys(attributes).forEach(
    //     (a) => (copy[a] = generateNumber(attributes[a]))
    //   );
    //   p.attributes.sp_defense = copy.sp_defense;
    //   p.save().then((r) => console.log(r));
    // });
  } else if (message.startsWith("accept battle")) {
    const id = message.slice("accept battle".length).trim();
    const invite = currentInvites.find((invite) => invite.id === id);

    if (invite) {
      const [p1Pokemon, p2Pokemon] = await Promise.all([
        OwnedPokemon.find({ user: invite.challenger.id }).limit(6),
        OwnedPokemon.find({ user: invite.challenged.id }).limit(6),
      ]);

      const p1 = p1Pokemon.map((p) => {
        return new Pokemon({
          id: p.id,
          name: p.name,
          number: p.number,
          level: 1,
          attributes: p.attributes,
          moves,
          types: ["normal"],
        });
      }) as unknown as [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];
      const p2 = p2Pokemon.map((p) => {
        return new Pokemon({
          id: p.id,
          name: p.name,
          number: p.number,
          level: 1,
          attributes: p.attributes,
          moves,
          types: ["normal"],
        });
      }) as unknown as [Pokemon, Pokemon, Pokemon, Pokemon, Pokemon, Pokemon];

      const challengerKey = uuid();
      const challengedKey = uuid();

      const battle = new Battle(
        {
          name: challengerKey,
          pokemon: p1,
        },
        {
          name: challengedKey,
          pokemon: p2,
        }
      );

      activeBattles.push(battle);

      battle.events.subscribe((event) => {
        if (event.id === "start") {
          invite.challenger.send(
            `[Access battle](http://localhost:8080/#/batalhas/${challengerKey})`
          );
          invite.challenged.send(
            `[Access battle](http://localhost:8080/#/batalhas/${challengedKey})`
          );
        } else if (event.id === "pokemonMove") {
          // const me =
          //   event.value.player === "p1" ? invite.challenger : invite.challenged;
          // const adversary =
          //   event.value.player === "p1" ? invite.challenged : invite.challenger;

          // const myMessage = new MessageEmbed().setDescription(
          //   `You used ${event.value.move}!`
          // );

          // const messageToAdversary = new MessageEmbed().setDescription(
          //   `Your enemy used ${event.value.move}!`
          // );

          // me.send(myMessage);
          // adversary.send(messageToAdversary);
        } else if (event.id === "resultTurn") {
          // const handleDefeat = (player: "p1" | "p2"): boolean => {
          //   const me = event.value.player === "p1" ? invite.challenger : invite.challenged;
          //   const adversary = event.value.player === "p1" ? invite.challenged : invite.challenger;
          //   const pokemonList =
          //     activeBattle.battle?.[player].pokemon
          //       .filter((e) => e.hp > 0)
          //       .map((e) => e.originalPokemon.name) || [];
          //   activeBattle[player]?.user.send("Your pokemon has been defeated!");
          //   if (pokemonList.length > 0) {
          //     activeBattle[player]?.user.send(
          //       `Choose another pokemon: ${pokemonList}`
          //     );
          //     activeBattle[enemy]?.user.send(
          //       "Your oponnent has been defeated!"
          //     );
          //   } else {
          //     activeBattle[player]?.user.send(`You lose!`);
          //     activeBattle[enemy]?.user.send(
          //       `You win! You have defeated ${activeBattle[player]?.user}`
          //     );
          //     activeBattle = {};
          //     return true;
          //   }
          //   return false;
          // };
          // if (event.value.defeats.p1) {
          //   if (handleDefeat("p1")) return;
          // }
          // if (event.value.defeats.p2) {
          //   if (handleDefeat("p2")) return;
          // }
          // const message = `${activeBattle.p1?.user} ${
          //   activeBattle.battle?.p1.inBattle.originalPokemon.name
          // }: ${
          //   ((activeBattle.battle?.p1.inBattle.hp || 1) /
          //     (activeBattle.battle?.p1.inBattle.totalHp || 1)) *
          //   100
          // }%
          // ${activeBattle.p2?.user} ${
          //   activeBattle.battle?.p2.inBattle.originalPokemon.name
          // }: ${
          //   ((activeBattle.battle?.p2.inBattle.hp || 1) /
          //     (activeBattle.battle?.p2.inBattle.totalHp || 1)) *
          //   100
          // }%`;
          // const reply = new MessageEmbed()
          //   .setDescription(message)
          //   .setColor("#f39c12");
          // notifyPlayers(reply);
          // sendMovesToPlayers();
        }
      });

      // sendMovesToPlayers();
    } else {
      m.author.send("Not find this battle");
    }
  } else if (message.startsWith("!battle")) {
    if (m.mentions.users.size === 1) {
      const challenged = m.mentions.users.first() as User;
      const invite = new InviteBattle(m.author, challenged);
      currentInvites.push(invite);
      challenged.send(
        `${m.author} call you to battle! Type "accept battle ${invite.id}" or "not today" to give away."`
      );
    } else if (m.mentions.users.size === 0) {
      m.channel.send("Need mention someone to battle");
    } else {
      m.channel.send("Need only one mention");
    }
  }
});
