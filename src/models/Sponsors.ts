import { Schema, model, models } from "mongoose";

export interface ISponsor {
  _id: string;
  name: string;
  imagen?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorsSchema = new Schema<ISponsor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [50, "Name must be at most 50 characters"],
    },
    imagen: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Sponsors = models.Sponsors || model<ISponsor>("Sponsors", SponsorsSchema);
export default Sponsors;
