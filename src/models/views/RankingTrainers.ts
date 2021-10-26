import { Document, model, Schema } from "mongoose";

export interface RankingTrainers extends Document {
  user: string;
  pokemon: number;
  value: number;
  index: number;
}

export const RankingTrainersSchema = new Schema({
  user: String,
  pokemon: Number,
  value: Number,
  index: {
    type: Number,
    get: (index: number) => index + 1,
  },
});

export default model<RankingTrainers>(
  "RankingTrainers",
  RankingTrainersSchema,
  "RankingTrainers"
);
