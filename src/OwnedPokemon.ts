import { Document, model, Schema } from "mongoose";

export interface OwnedPokemon extends Document {
  id: String;
  name: String;
  number: Number;
  user: String;
  original_user: String;
  created_at: Date;
  level: Number;
  moves: [string, string, string, string];
  attributes: {
    hp: Number;
    attack: Number;
    defense: Number;
    sp_attack: Number;
    sp_defense: Number;
    speed: Number;
  };
}

const OwnedPokemonSchema = new Schema({
  id: { type: String, required: true, unique: true },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  user: { type: String, required: true },
  original_user: { type: String, required: true },
  created_at: { type: Date, required: true, default: new Date() },
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
});

export default model<OwnedPokemon>("OwnedPokemon", OwnedPokemonSchema);
