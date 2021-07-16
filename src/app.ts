import { DMChannel, Invite, MessageEmbed, User } from "discord.js";
import axios from "axios";

import Database from "./MongoDatabase";
import OwnedPokemon from "./models/OwnedPokemon";
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
import handleBattle from "./messages/battle";
import handleInfo from "./messages/info";
import { mark } from "./messages/pokemon";
import handleTrade, { acceptTrade, refuseTrade } from "./messages/trade";
import Pokemon from "./Pokemon";
import useSocket from "./socket";
import { v4 as uuid } from "uuid";
import express, { json } from "express";
import cors from "cors";
import { activeBattles } from "./battle-manager";
import qs from "qs";
import MoreStrongPokemon from "./models/MoreStrongPokemon";
import { currentInvites, acceptInvite } from "./invite-manager";
import randomString from "randomstring";

const app = express();

const port = process.env.PORT || 8081;

const server = app
  .use(cors())
  .use(json())
  .listen(port, () => console.log(`Server online on port ${port}`));

useSocket(server);

new Database().connect();

app.get("/users", async (req, res) => {
  const pokemon = await MoreStrongPokemon.find();
  return res.json({ pokemon });
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const pokemon = await MoreStrongPokemon.find(
    { user: id },
    "-_id name number total id created_at"
  );
  return res.json({ pokemon });
});

app.post("/battles", async (req, res) => {
  const id = req.body.id;
  const invite = currentInvites.find((invite) => invite.id === id);

  if (invite) {
    const battle = await acceptInvite(invite);
    return res.status(201).json({ id: battle.id });
  } else {
    return res.status(404).send();
  }
});

app.post("/login", async (req, res) => {
  const { code } = req.body;

  const obj = {
    client_id: "855825211826896906",
    client_secret: "UePrbti0Rr_sDJIqDghfFwd14CjU5uGo",
    code,
    grant_type: "authorization_code",
    redirect_uri: `http://localhost:8080`,
    scope: "identify",
  };

  if (code) {
    try {
      const token = await axios.post(
        "https://discord.com/api/oauth2/token",
        qs.stringify(obj),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      return res.json(token.data);
    } catch {
      return res.status(400).send();
    }
  }
});

app.get("/update", async (req, res) => {
  (await OwnedPokemon.find()).forEach((e) => {
    e.id = randomString.generate(6);
    e.marks.tradable = false;
    e.save();
  });
  return res.send("ok");
});

app.post("/@me", async (req, res) => {
  const token = req.body;
  console.log(token);
  const usuario = await axios.get("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${token.token_type} ${token.access_token}`,
    },
  });
  return res.json(usuario.data);
});

const maxInterval = 10 * 60 * 1000;

const chanceInterval = 24 * 60 * 60 * 1000;

setInterval(async () => {
  const now = new Date().getTime();
  const timeDifference = now - useLastPokemon().date.getTime();
  const probability = timeDifference / maxInterval;
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
    .setDescription("Who's that pokemon?")
    .setImage(pokemon.data.sprites.other["official-artwork"].front_default);

  useChannel().send(message);
}, chanceInterval);

function devMessage(msg: string) {
  return `$${msg}`;
}

function messageIs(message: string, compair: string) {
  const m = process.env.DEVMODE ? devMessage(compair) : compair;
  return message === m;
}

function messageStartsWith(message: string, startsWith: string) {
  const m = process.env.DEVMODE ? devMessage(startsWith) : startsWith;
  return message.startsWith(m);
}

useClient().on("message", async (m) => {
  const message = m.content.toLowerCase();
  const lastPokemon = useLastPokemon().pokemon?.name.toLowerCase();
  if (messageIs(message, lastPokemon)) handleLastPokemon(m);
  else if (messageIs(message, "dex")) handleDex(m);
  else if (messageStartsWith(message, "!battle")) handleBattle(m);
  else if (messageStartsWith(message, "trade")) handleTrade(m);
  else if (messageStartsWith(message, "mark")) mark(m);
  else if (messageStartsWith(message, "unmark")) mark(m);
  else if (messageStartsWith(message, "accept")) acceptTrade(m);
  else if (messageStartsWith(message, "refuse")) refuseTrade(m);
});
