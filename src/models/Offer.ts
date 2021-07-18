import { Document, model, Schema } from "mongoose";
import { generate } from "randomstring";

export interface Offer extends Document {
  id: string;
  created_at: Date;
  offeror: string;
  owner: string;
  giving: any[];
  retrieving: any[];
}

export const OfferSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => generate(5),
  },
  created_at: { type: Date, required: true, default: Date.now },
  offeror: { type: String, required: true },
  owner: { type: String, required: true },
  giving: { type: [Object], required: true },
  retrieving: { type: [Object], required: true },
});

export default model<Offer>("Offers", OfferSchema);
