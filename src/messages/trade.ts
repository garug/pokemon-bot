import { Message } from "discord.js";
import Offer from "../models/Offer";
import OwnedPokemon from "../models/OwnedPokemon";

export default async function trade(m: Message) {
  const [_, idSent, idReceive] = m.content.split(" ");

  const pokemon = await OwnedPokemon.findOne({ id: idSent, user: m.author.id });

  if (!pokemon) {
    m.channel.send(`${m.author} you do not have this pokemon`);
    return;
  }

  const retrievePokemon = await OwnedPokemon.findOne({ id: idReceive });

  if (!retrievePokemon?.marks.tradable) {
    m.channel.send(`${m.author} this pokemon its not tradable.`);
    return;
  }

  const offer = await Offer.create({
    offeror: m.author.id,
    owner: retrievePokemon.user,
    giving: [
      {
        pokemon: pokemon.id,
      },
    ],
    retrieving: [
      {
        pokemon: retrievePokemon.id,
      },
    ],
  });

  const msg = `${m.author} want trade ${pokemon.id} for ${retrievePokemon.id}. Type "accept/refuse ${offer.id}."`;

  m.channel.send(msg);
}

export async function acceptTrade(m: Message) {
  const [_, idOffer] = m.content.split(" ");

  const offer = await Offer.findOne({ id: idOffer, owner: m.author.id });

  if (offer) {
    offer.giving.forEach(async (item) => {
      if (item.pokemon) {
        console.log(item);
        await OwnedPokemon.updateOne(
          { id: item.pokemon },
          { user: offer.owner, "marks.tradable": false }
        );
      }
    });
    offer.retrieving.forEach(async (item) => {
      if (item.pokemon) {
        await OwnedPokemon.updateOne(
          { id: item.pokemon },
          { user: offer.offeror, "marks.tradable": false }
        );
      }
    });
    m.channel.send(`Trade ${offer.id} successfully!`);
    offer.delete();
  } else {
    m.channel.send(`${m.author} something wrong with your command.`);
  }
}

export async function refuseTrade(m: Message) {
  const [_, idOffer] = m.content.split(" ");

  const offer = await Offer.findOne({ id: idOffer, owner: m.author.id });

  if (offer) {
    m.channel.send(`Trade ${offer.id} refused.`);
    offer.delete();
  } else {
    m.channel.send(`${m.author} something wrong with your command.`);
  }
}
