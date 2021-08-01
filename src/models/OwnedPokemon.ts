import { Document, model, Schema } from "mongoose";
import { generate } from "randomstring";

export interface OwnedPokemon extends Document {
  id: string;
  name: string;
  number: number;
  user: string;
  original_user: string;
  created_at: Date;
  level: number;
  moves: [string, string, string, string];
  marks: {
    tradable: boolean;
  };
  attributes: {
    hp: number;
    attack: number;
    defense: number;
    sp_attack: number;
    sp_defense: number;
    speed: number;
  };
}

export const OwnedPokemonSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => generate(6),
  },
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
  marks: {
    tradable: { type: Boolean, default: false },
  },
  attributes: {
    hp: Number,
    attack: Number,
    defense: Number,
    sp_attack: Number,
    sp_defense: Number,
    speed: Number,
  },
});

export default model<OwnedPokemon>("OwnedPokemon", OwnedPokemonSchema);
