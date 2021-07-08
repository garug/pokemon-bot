import { model, Schema } from "mongoose";
import { Set } from "./Set";

export interface SetPokemon {
  set: Set;
  pokemon_number: number;
  chance: number;
}

const SetPokemonSchema = new Schema({
  set: { type: Schema.Types.ObjectId, required: true, ref: "Set" },
  pokemon_number: { type: Number, required: true },
  chance: { type: Number, required: true },
});

export default model<SetPokemon>("SetPokemon", SetPokemonSchema);
