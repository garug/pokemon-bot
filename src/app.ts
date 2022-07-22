import "newrelic";
import { MessageEmbed } from "discord.js";
import axios from "axios";

import Database from "./MongoDatabase";
import OwnedPokemon from "./models/OwnedPokemon";
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
} from "./discordStuff";
import handleDex from "./messages/dex";
import { mark, unmark } from "./messages/pokemon";
import handleTrade, { acceptTrade, refuseTrade } from "./messages/trade";
import useSocket from "./socket";
import express, { json, RequestHandler } from "express";
import cors from "cors";
import MoreStrongPokemon from "./models/views/MoreStrongPokemon";
import { currentInvites, acceptInvite } from "./invite-manager";
import SetCollection from "./Set";
import { approvalStatus, createOffer } from "./managers/offers";
import Offer from "./models/Offer";
import { handleTraining } from "./messages/training";
import RankingTrainers from "./models/views/RankingTrainers";
import { handleRanking } from "./messages/ranking";
import handleTier from "./messages/tier";
import { updatePokemon } from "./managers/tier";
import {sort} from "./lib/utils";

const app = express();

const port = process.env.PORT || 8081;

const server = app
  .use(cors())
  .use(json())
  .listen(port, () => {
    console.log(`Server online on port ${port}`);
  });

useSocket(server);

new Database().connect();

app.get("/", async (req, res) => {
  // const a = await RankingTrainers.find();
  // console.log(a);
  res.send("ok");
});

app.get("/info", async (req, res) => {
  return res.send({
    lastPokemon: useLastPokemon()
  });
})

app.get("/update", async(req, res) => {
  await updatePokemon();
  return res.send("updated");
})

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

app.get("/pokemon", async (req, res) => {
  const { limit, user, name, page } = req.query as any;

  const filters: any = {};
  let usedLimit = parseInt(limit);

  if (user) {
    filters.user = user;
  }

  if (name) {
    filters.name = { $regex: name };
  }

  if (page && !limit) {
    usedLimit = 10;
  }

  const pokemon = await MoreStrongPokemon.find(filters)
    .skip((page - 1) * usedLimit)
    .limit(usedLimit);
  return res.json(pokemon);
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

app.post("/offers", async (req, res) => {
  // TODO não permitir criar offers iguais
  const offer = await createOffer(req.body);
  return res.status(201).json(offer);
});

app.post("/offers/:id/approval-status", async (req, res) => {
  const { id } = req.params as any;
  const { status } = req.body as any;
  const authorization = req.headers.authorization;

  if (!authorization) return res.sendStatus(403);

  const [user, offer] = await Promise.all([
    fetchUser(authorization),
    Offer.findOne({ id }),
  ]);

  if (!offer) {
    return res.sendStatus(404);
  }

  if (offer.owner !== user.data.id) {
    return res.sendStatus(401);
  }

  approvalStatus(offer, status);

  return res.sendStatus(201);
});

app.get("/offers", async (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) return res.sendStatus(403);

  const { data: user } = await fetchUser(authorization);

  const offers = await Offer.find({
    $or: [{ owner: user.id }, { offeror: user.id }],
  });
  const allPokemon = offers
    .flatMap((offer) => [...offer.retrieving, ...offer.giving])
    .map((e) => e.pokemon);

  const usedPokemon = await MoreStrongPokemon.find({ id: { $in: allPokemon } });

  const returned = offers.map((offer) => {
    const map = (arr: any[]) => {
      return arr.map((p) => usedPokemon.find((p2) => p2.id === p.pokemon));
    };

    const obj = {
      ...offer.toObject(),
      retrievedPokemon: map(offer.retrieving)[0],
      sentPokemon: map(offer.giving)[0],
    } as any;

    delete obj.retrieving;
    delete obj.giving;
    delete obj._id;

    return obj;
  });

  return res.json(returned);
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

async function fetchUser(authorization: string) {
  return axios.get<any>("https://discord.com/api/users/@me", {
    headers: {
      authorization,
    },
  });
}

app.post("/@me", async (req, res) => {
  const { token_type, access_token } = req.body;
  const usuario = await fetchUser(`${token_type} ${access_token}`);
  return res.json(usuario.data);
});

const maxInterval = 12 * 60 * 1000;

const admTries = async () => {
  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setTitle("Falhou")
    .setDescription("<@&862861715937951744> tentou mas n deu")

  useChannel().send({ embeds: [message] });
}

app.get("/call", async (req, res) => {
  const { key } = req.query;

  if (key !== process.env.CALLABLE_POKEMON && key !== process.env.SENSATO)
    return res.status(401).send();

  const now = new Date().getTime();
  const timeDifference = now - useLastPokemon().date.getTime();
  const probability = timeDifference / maxInterval;
  const test = probability > Math.random() || key === process.env.SENSATO;

  if (!test && key === process.env.SENSATO)
    admTries();

  if (!test || (await lastPokemonRunAway())) return res.send("ok1");

  const possiblePokemon = Array.from(
    await SetCollection.find({
      active: true,
    })
  ).flatMap((set) => set.pokemon);

  const sortedPokemon = sort(possiblePokemon, (p) => p.chance);

  const pokemon = await axios.get<any>(
    `https://pokeapi.co/api/v2/pokemon/${sortedPokemon.number}/`
  );

  const { name, stats, id } = pokemon.data;

  const shiny = Math.random() < 0.01;

  updateLastPokemon({
    name,
    stats,
    id,
    shiny,
  });

  const message = new MessageEmbed()
    .setColor("#f39c12")
    .setTitle("A wild pokemon appeared")
    .setDescription("Who's that pokemon?" + (shiny ? " ✨✨✨" : ""))
    .setImage(pokemon.data.sprites.other["official-artwork"].front_default);

  useChannel().send({ embeds: [message] });

  return res.send("ok2");
});

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

useClient().on("messageCreate", async (m) => {
  const message = m.content.toLowerCase();
  const lastPokemon = useLastPokemon().pokemon?.name.toLowerCase();
  if (lastPokemon && messageIs(message, lastPokemon)) handleLastPokemon(m);
  else if (messageIs(message, "dex")) handleDex(m);
  else if (messageStartsWith(message, "trade")) handleTrade(m);
  else if (messageStartsWith(message, "mark")) mark(m);
  else if (messageStartsWith(message, "unmark")) unmark(m);
  else if (messageStartsWith(message, "accept")) acceptTrade(m);
  else if (messageStartsWith(message, "refuse")) refuseTrade(m);
  else if (messageStartsWith(message, "tt")) handleTraining(m);
  else if (messageStartsWith(message, "ranking")) handleRanking(m);
  else if (messageStartsWith(message, "tier")) handleTier(m);
});
