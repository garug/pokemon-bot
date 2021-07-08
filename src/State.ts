import { Document, model, Schema } from "mongoose";

export interface State extends Document {
  key: string;
  value?: string;
}

const StateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String },
});

export default model<State>("State", StateSchema);
