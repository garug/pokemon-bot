import { Document, model, Schema } from "mongoose";
import { OwnedPokemon, OwnedPokemonSchema } from "./OwnedPokemon";

export interface MoreStrongPokemon extends OwnedPokemon {}

const MoreStrongPokemonSchema = new Schema({
  id: { type: String, required: true, unique: true },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  user: { type: String, required: true },
  original_user: { type: String, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  level: { type: Number, required: true },
  moves: {
    type: String,
    validate: [
      (val: Array<string>) => val.length === 4,
      "{moves} needs four elements",
    ],
  },
  attributes: {
    hp: Number,
    attack: Number,
    defense: Number,
    sp_attack: Number,
    sp_defense: Number,
    speed: Number,
  },
  total: Number,
});

export default model<OwnedPokemon>(
  "moreStrong",
  MoreStrongPokemonSchema,
  "moreStrong"
);
