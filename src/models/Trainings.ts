import { model, Schema, SchemaTypes } from "mongoose";

export interface Training extends Document {
  user: string;
  pokemon: string;
  mod: number;
  created_at: Date;
  finish_at: Date;
}

export const TrainingSchema = new Schema({
  user: { type: String, required: true },
  pokemon: { type: String, unique: true, required: true },
  finish_at: { type: Date, required: true },
  mod: { type: Number, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default model<Training>("Training", TrainingSchema);

export function useTraining() {
  return {
    user: String,
    attributes: SchemaTypes.Mixed,
    created_at: {
      type: Date,
      default: Date.now,
    },
  };
}
