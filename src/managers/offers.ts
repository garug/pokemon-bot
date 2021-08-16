import OfferModel, { Offer } from "../models/Offer";
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
  return await OfferModel.create({
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

export async function approvalStatus(offer: Offer, approved: boolean) {
  if (approved) {
    const handleItem = async (item: any, user: string) => {
      if (item.pokemon) {
        OfferModel.deleteMany({
          id: { $ne: offer.id },
          "retrieving.pokemon": { $elemMatch: item.pokemon },
          "giving.pokemon": { $elemMatch: item.pokemon },
        });
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
