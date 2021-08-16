import Offer from "../models/Offer";
import OwnedPokemon from "../models/OwnedPokemon";

interface CreateOffer {
  owner: {
    id: string;
    pokemon_id: string;
  };
  offeror: {
    id: string;
    pokemon_id: string;
  };
}

export async function createOffer(creating: CreateOffer) {
  return await Offer.create({
    offeror: creating.offeror.id,
    owner: creating.owner.id,
    giving: [
      {
        pokemon: creating.offeror.pokemon_id,
      },
    ],
    retrieving: [
      {
        pokemon: creating.owner.pokemon_id,
      },
    ],
  });
}

export async function approvalStatus(id: string, approved: boolean) {
  const offer = await Offer.findOne({ id });

  if (!offer) throw { name: "not-found", message: "Not found offer" };

  if (approved) {
    const handleItem = async (item: any, user: string) => {
      if (item.pokemon) {
        await OwnedPokemon.updateOne(
          { id: item.pokemon },
          { user, "marks.tradable": false }
        );
      }
    };

    offer.giving.forEach(async (item) => handleItem(item, offer.owner));
    offer.retrieving.forEach(async (item) => handleItem(item, offer.offeror));
  }

  offer.delete();
}
