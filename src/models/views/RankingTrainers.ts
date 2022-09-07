import { Document, model, Schema } from "mongoose";

export interface RankingTrainers extends Document {
  user: string;
  id_dex: number;
  value: number;
  index: number;
}

export const RankingTrainersSchema = new Schema({
  user: String,
  id_dex: Number,
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
