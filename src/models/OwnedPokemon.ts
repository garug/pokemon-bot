import { Document, model, Schema, SchemaTypes } from "mongoose";
import { sum, values } from "lodash";
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
    shiny: boolean;
  };
  attributes: Attributes;
  trainings: {
    user: string;
    mod: number;
    attributes: Attributes;
    created_at: Date;
  }[];
  total: number;
}

export interface Attributes {
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
}

export function useAttributes() {
  return {
    hp: Number,
    attack: Number,
    defense: Number,
    sp_attack: Number,
    sp_defense: Number,
    speed: Number,
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
    shiny: { type: Boolean, default: false },
  },
  attributes: useAttributes(),
  trainings: [
    {
      user: String,
      mod: Number,
      attributes: useAttributes(),
      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

OwnedPokemonSchema.virtual("total").get(function (this: OwnedPokemon) {
  const all = [
    ...values(this.attributes),
    ...this.trainings.flatMap((t) => values(t.attributes)),
  ];

  return sum(all);
});

export default model<OwnedPokemon>("OwnedPokemon", OwnedPokemonSchema);
