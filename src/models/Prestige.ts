import { Document, model, Schema } from "mongoose";

import { TierName } from "../managers/tier";

export interface Prestige extends Document {
  user: string;
  pokemon: number;
  value: number;
}

export const PrestigeSchema = new Schema({
  user: String,
  pokemon: Number,
  value: Number,
});

export default model<Prestige>("Prestige", PrestigeSchema);
