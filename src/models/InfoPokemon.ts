import { Document, model, Schema } from "mongoose";

export interface InfoPokemon extends Document {
  number: number;
  name: string;
  tiers: {
    order: number;
    tier: string;
    value: number;
  }[];
}

export const InfoPokemonSchema = new Schema({
  number: Number,
  name: String,
  tiers: [
    {
      order: Number,
      tier: String,
      value: Number,
    },
  ],
});

export default model<InfoPokemon>("InfoPokemon", InfoPokemonSchema);
