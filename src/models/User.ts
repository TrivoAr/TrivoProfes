import { Schema, model, models } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  rol: "alumno" | "profe" | "dueño de academia" | "admin";
  telnumber?: string;
  imagen?: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  trialConfig?: {
    haUsadoTrial: boolean;
    academiasConTrial: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    rol: {
      type: String,
      enum: ["alumno", "profe", "dueño de academia", "admin"],
      required: true,
    },
    telnumber: { type: String },
    imagen: { type: String },
    bio: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    trialConfig: {
      haUsadoTrial: { type: Boolean, default: false },
      academiasConTrial: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
