import { Document, model, Schema } from "mongoose";

export interface Set extends Document {
  id: string;
  name: string;
  active: boolean;
  last_active: Date;
  pokemon: {
    chance: number;
    id_dex: number;
  }[];
}

const SetSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  active: { type: Boolean, required: true },
  last_active: { type: Date, required: true },
  created_at: { type: Date, required: true },
  pokemon: [
    {
      chance: Number,
      id_dex: Number,
    },
  ],
});

const types = {
  level1: 100,
  level2_3: 70,
  level2_2: 55,
  level_unique: 60,
  evo_stone: 55,
  level3_3: 50,
  mystic: 5,
  legendary: 1,
};

export default model<Set>("Set", SetSchema);
