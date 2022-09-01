import { Document, model, Schema } from "mongoose";
import { BasicTier } from "../managers/tier";
import { v4 } from "uuid";

export interface InfoPokemon extends Document {
  id_dex: number;
  name: string;
  tiers: BasicTier[];
  forms: PokemonForm[];
}

export interface PokemonForm {
  id: string;
  id_api: number;
  use_specie_name: boolean;
  name: string;
  image: string;
  chance: number;
}

export const InfoPokemonSchema = new Schema({
  id_dex: Number,
  name: String,
  forms: [
    {
      id: {
        type: String,
        default: v4,
      },
      id_api: Number,
      use_specie_name: Boolean,
      name: String,
      image: String,
      chance: {
        type: Number,
        default: 1,
      },
    }
  ],
  tiers: [
    {
      order: Number,
      name: String,
      value: Number,
    },
  ],
});

export default model<InfoPokemon>("InfoPokemon", InfoPokemonSchema);
