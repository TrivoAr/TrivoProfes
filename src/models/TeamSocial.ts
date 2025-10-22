import { Schema, model, models } from "mongoose";

export interface ITeamSocial {
  _id: string;
  nombre: string;
  ubicacion: string;
  precio: string;
  deporte: string;
  fecha: string;
  hora: string;
  duracion: string;
  localidad?: string;
  provincia?: string;
  telefonoOrganizador?: string;
  whatsappLink?: string;
  descripcion?: string;
  imagen?: string;
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  creadorId: Schema.Types.ObjectId;
  cupo: number;
  cbu?: string;
  alias?: string;
  dificultad?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSocialSchema = new Schema<ITeamSocial>(
  {
    nombre: { type: String, required: true },
    ubicacion: { type: String, required: true },
    precio: { type: String, required: true },
    deporte: { type: String, required: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    duracion: { type: String, required: true },
    localidad: { type: String },
    provincia: { type: String },
    telefonoOrganizador: { type: String },
    whatsappLink: { type: String },
    descripcion: { type: String },
    imagen: { type: String },
    locationCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    creadorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cupo: { type: Number, required: true },
    cbu: { type: String },
    alias: { type: String },
    dificultad: { type: String },
  },
  { timestamps: true }
);

const TeamSocial = models.TeamSocial || model<ITeamSocial>("TeamSocial", TeamSocialSchema);
export default TeamSocial;
