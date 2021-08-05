import { DMChannel, Invite, MessageEmbed, User } from "discord.js";
import axios from "axios";

import Database from "./MongoDatabase";
import OwnedPokemon from "./models/OwnedPokemon";
import { generateNumber, randomPokemon } from "./lib/utils";
import Battle, { Player } from "./Battle";
import Move, { moves } from "./lib/moves";
import handleLastPokemon, {
  lastPokemonRunAway,
  updateLastPokemon,
  useLastPokemon,
} from "./messages/lastPokemon";
import {
  generateToken,
  refreshToken,
  revokeToken,
  useChannel,
  useClient,
} from "./discord";
import handleDex from "./messages/dex";
import handleBattle from "./messages/battle";
import handleInfo from "./messages/info";
import { mark, unmark } from "./messages/pokemon";
import handleTrade, { acceptTrade, refuseTrade } from "./messages/trade";
import useSocket from "./socket";
import express, { json } from "express";
import cors from "cors";
import { activeBattles } from "./battle-manager";
import qs from "qs";
import MoreStrongPokemon from "./models/MoreStrongPokemon";
import { currentInvites, acceptInvite } from "./invite-manager";
import randomString from "randomstring";
import SetCollection from "./Set";

const app = express();

const port = process.env.PORT || 8081;

const server = app
  .use(cors())
  .use(json())
  .listen(port, () => console.log(`Server online on port ${port}`));

useSocket(server);

new Database().connect();

app.get("/", async (req, res) => {
  const resultado = await SetCollection.findOne({
    id: "9b820ad7-291c-467e-bdf1-ca73fd1f29d8",
  });
  if (!resultado) return;
  resultado.pokemon = [
    {
      chance: 100,
      number: 10,
    },
    {
      chance: 50,
      number: 3,
    },
    {
      chance: 50,
      number: 15,
    },
    {
      chance: 100,
      number: 35,
    },
    {
      chance: 55,
      number: 53,
    },
    {
      chance: 55,
      number: 78,
    },
    {
      chance: 55,
      number: 87,
    },
    {
      chance: 100,
      number: 88,
    },
    {
      chance: 100,
      number: 109,
    },
    {
      chance: 60,
      number: 128,
    },
    {
      chance: 55,
      number: 28,
    },
    {
      chance: 70,
      number: 8,
    },
    {
      chance: 70,
      number: 64,
    },
    {
      chance: 100,
      number: 29,
    },
    {
      chance: 100,
      number: 32,
    },
    {
      chance: 100,
      number: 46,
    },
    {
      chance: 55,
      number: 22,
    },
    {
      chance: 100,
      number: 54,
    },
    {
      chance: 70,
      number: 70,
    },
    {
      chance: 70,
      number: 11,
    },
    {
      chance: 55,
      number: 20,
    },
    {
      chance: 55,
      number: 59,
    },
    {
      chance: 50,
      number: 62,
    },
    {
      chance: 100,
      number: 63,
    },
    {
      chance: 50,
      number: 71,
    },
    {
      chance: 100,
      number: 86,
    },
    {
      chance: 55,
      number: 91,
    },
    {
      chance: 60,
      number: 95,
    },
    {
      chance: 100,
      number: 98,
    },
    {
      chance: 100,
      number: 104,
    },
    {
      chance: 55,
      number: 112,
    },
    {
      chance: 55,
      number: 121,
    },
    {
      chance: 60,
      number: 127,
    },
    {
      chance: 100,
      number: 19,
    },
    {
      chance: 50,
      number: 68,
    },
    {
      chance: 55,
      number: 26,
    },
    {
      chance: 100,
      number: 72,
    },
    {
      chance: 55,
      number: 82,
    },
    {
      chance: 50,
      number: 34,
    },
    {
      chance: 60,
      number: 108,
    },
    {
      chance: 55,
      number: 47,
    },
    {
      chance: 60,
      number: 115,
    },
    {
      chance: 55,
      number: 85,
    },
    {
      chance: 60,
      number: 125,
    },
    {
      chance: 60,
      number: 114,
    },
    {
      chance: 100,
      number: 138,
    },
    {
      chance: 55,
      number: 117,
    },
    {
      chance: 60,
      number: 143,
    },
    {
      chance: 100,
      number: 120,
    },
    {
      chance: 60,
      number: 131,
    },
    {
      chance: 70,
      number: 139,
    },
    {
      chance: 55,
      number: 40,
    },
    {
      chance: 50,
      number: 45,
    },
    {
      chance: 70,
      number: 61,
    },
    {
      chance: 70,
      number: 75,
    },
    {
      chance: 60,
      number: 107,
    },
    {
      chance: 100,
      number: 60,
    },
    {
      chance: 70,
      number: 67,
    },
    {
      chance: 100,
      number: 79,
    },
    {
      chance: 100,
      number: 81,
    },
    {
      chance: 60,
      number: 83,
    },
    {
      chance: 100,
      number: 96,
    },
    {
      chance: 100,
      number: 102,
    },
    {
      chance: 60,
      number: 126,
    },
    {
      chance: 2,
      number: 144,
    },
    {
      chance: 50,
      number: 9,
    },
    {
      chance: 100,
      number: 13,
    },
    {
      chance: 50,
      number: 18,
    },
    {
      chance: 55,
      number: 55,
    },
    {
      chance: 55,
      number: 57,
    },
    {
      chance: 55,
      number: 89,
    },
    {
      chance: 55,
      number: 101,
    },
    {
      chance: 55,
      number: 105,
    },
    {
      chance: 55,
      number: 110,
    },
    {
      chance: 100,
      number: 111,
    },
    {
      chance: 100,
      number: 116,
    },
    {
      chance: 60,
      number: 142,
    },
    {
      chance: 1,
      number: 151,
    },
    {
      chance: 100,
      number: 69,
    },
    {
      chance: 70,
      number: 30,
    },
    {
      chance: 100,
      number: 92,
    },
    {
      chance: 50,
      number: 94,
    },
    {
      chance: 100,
      number: 100,
    },
    {
      chance: 55,
      number: 119,
    },
    {
      chance: 100,
      number: 140,
    },
    {
      chance: 100,
      number: 4,
    },
    {
      chance: 100,
      number: 43,
    },
    {
      chance: 55,
      number: 73,
    },
    {
      chance: 55,
      number: 130,
    },
    {
      chance: 60,
      number: 137,
    },
    {
      chance: 2,
      number: 146,
    },
    {
      chance: 1,
      number: 150,
    },
    {
      chance: 100,
      number: 1,
    },
    {
      chance: 100,
      number: 16,
    },
    {
      chance: 70,
      number: 38,
    },
    {
      chance: 100,
      number: 56,
    },
    {
      chance: 100,
      number: 58,
    },
    {
      chance: 100,
      number: 74,
    },
    {
      chance: 55,
      number: 80,
    },
    {
      chance: 55,
      number: 97,
    },
    {
      chance: 55,
      number: 103,
    },
    {
      chance: 60,
      number: 113,
    },
    {
      chance: 60,
      number: 122,
    },
    {
      chance: 55,
      number: 136,
    },
    {
      chance: 55,
      number: 24,
    },
    {
      chance: 100,
      number: 37,
    },
    {
      chance: 100,
      number: 52,
    },
    {
      chance: 100,
      number: 66,
    },
    {
      chance: 100,
      number: 84,
    },
    {
      chance: 100,
      number: 90,
    },
    {
      chance: 55,
      number: 99,
    },
    {
      chance: 100,
      number: 129,
    },
    {
      chance: 50,
      number: 6,
    },
    {
      chance: 50,
      number: 12,
    },
    {
      chance: 55,
      number: 42,
    },
    {
      chance: 70,
      number: 93,
    },
    {
      chance: 60,
      number: 132,
    },
    {
      chance: 10,
      number: 149,
    },
    {
      chance: 70,
      number: 2,
    },
    {
      chance: 70,
      number: 17,
    },
    {
      chance: 100,
      number: 7,
    },
    {
      chance: 70,
      number: 14,
    },
    {
      chance: 55,
      number: 36,
    },
    {
      chance: 100,
      number: 41,
    },
    {
      chance: 100,
      number: 48,
    },
    {
      chance: 100,
      number: 50,
    },
    {
      chance: 55,
      number: 51,
    },
    {
      chance: 50,
      number: 65,
    },
    {
      chance: 60,
      number: 106,
    },
    {
      chance: 70,
      number: 5,
    },
    {
      chance: 100,
      number: 25,
    },
    {
      chance: 100,
      number: 27,
    },
    {
      chance: 100,
      number: 39,
    },
    {
      chance: 70,
      number: 44,
    },
    {
      chance: 55,
      number: 49,
    },
    {
      chance: 50,
      number: 76,
    },
    {
      chance: 60,
      number: 123,
    },
    {
      chance: 55,
      number: 134,
    },
    {
      chance: 55,
      number: 135,
    },
    {
      chance: 100,
      number: 21,
    },
    {
      chance: 100,
      number: 23,
    },
    {
      chance: 50,
      number: 31,
    },
    {
      chance: 70,
      number: 33,
    },
    {
      chance: 100,
      number: 77,
    },
    {
      chance: 100,
      number: 118,
    },
    {
      chance: 60,
      number: 124,
    },
    {
      chance: 100,
      number: 133,
    },
    {
      chance: 55,
      number: 141,
    },
    {
      chance: 2,
      number: 145,
    },
    {
      chance: 35,
      number: 147,
    },
    {
      chance: 25,
      number: 148,
    },
  ];
  resultado.save();
  res.json(resultado);
});

app.get("/users", async (req, res) => {
  const pokemon = await MoreStrongPokemon.find();
  return res.json({ pokemon });
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const pokemon = await MoreStrongPokemon.find({ user: id });
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

app.patch("/pokemon/:id/marks/tradable", async (req, res) => {
  // TODO fazer autenticação
  const pokemon = await OwnedPokemon.findOne({ id: req.params.id });

  if (!pokemon) return res.status(204).send();

  pokemon.marks.tradable = !pokemon.marks.tradable;
  pokemon.save();

  return res.send(pokemon.marks.tradable);
});

app.get("/pokemon/tradable", async (req, res) => {
  // TODO retirar pokemon do próprio usuário da request
  const pokemon = await MoreStrongPokemon.find({ "marks.tradable": true });

  return res.json(pokemon);
});

app.post("/login", async (req, res) => {
  const { code } = req.body;

  if (code) {
    try {
      return res.json(await generateToken(code));
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  } else {
    res.status(401).send();
  }
});

app.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (refresh_token) {
    try {
      return res.json(await refreshToken(refresh_token));
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  } else {
    res.status(401).send();
  }
});

app.post("/logout", async (req, res) => {
  const { token } = req.body;

  if (token) {
    try {
      await revokeToken(token);
      return res.status(200).send();
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  } else {
    res.status(401).send();
  }
});

app.post("/@me", async (req, res) => {
  const { token_type, access_token } = req.body;
  const usuario = await axios.get("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });
  return res.json(usuario.data);
});

const maxInterval = 12 * 60 * 1000;

const chanceInterval = process.env.DEVMODE
  ? 24 * 60 * 60 * 1000
  : 1 * 60 * 1000;

setInterval(async () => {
  const now = new Date().getTime();
  const timeDifference = now - useLastPokemon().date.getTime();
  const probability = timeDifference / maxInterval;
  const test = probability > Math.random();

  if (!test || (await lastPokemonRunAway())) return;

  const possiblePokemon = Array.from(
    await SetCollection.find({
      active: true,
    })
  ).flatMap((set) => set.pokemon);

  let total = 0;

  const probabilities = possiblePokemon.map((p) => {
    total += p.chance;
    return total;
  });

  const sortedNumber = Math.floor(Math.random() * (total - 1)) + 1;
  const sortedPokemon =
    possiblePokemon[probabilities.findIndex((n) => n > sortedNumber)];
  const pokemon = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${sortedPokemon.number}/`
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
  else if (messageStartsWith(message, "trade")) handleTrade(m);
  else if (messageStartsWith(message, "mark")) mark(m);
  else if (messageStartsWith(message, "unmark")) unmark(m);
  else if (messageStartsWith(message, "accept")) acceptTrade(m);
  else if (messageStartsWith(message, "refuse")) refuseTrade(m);
});
