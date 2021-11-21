import { Document, model, Schema } from "mongoose";
import { BasicTier } from "../managers/tier";

export interface InfoPokemon extends Document {
  number: number;
  name: string;
  tiers: BasicTier[];
}

export const InfoPokemonSchema = new Schema({
  number: Number,
  name: String,
  tiers: [
    {
      order: Number,
      name: String,
      value: Number,
    },
  ],
});

export default model<InfoPokemon>("InfoPokemon", InfoPokemonSchema);
