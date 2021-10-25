import { Document, model, Schema } from "mongoose";

export interface InfoPokemon extends Document {
  number: number;
  name: string;
}

export const InfoPokemonSchema = new Schema({
  number: Number,
  name: String,
});

export default model<InfoPokemon>("InfoPokemon", InfoPokemonSchema);
