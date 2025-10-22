import { Schema, model, models } from "mongoose";
import { DificultadSalida } from "@/lib/constants/salidas";

export interface ISalidaSocial {
  _id: string;
  nombre: string;
  ubicacion?: string;
  deporte?: string;
  fecha?: string;
  hora?: string;
  duracion?: string;
  descripcion?: string;
  localidad?: string;
  provincia?: string;
  telefonoOrganizador?: string;
  imagen?: string;
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  dificultad?: DificultadSalida;
  precio?: string;
  cupo: number;
  cbu?: string;
  alias?: string;
  creador_id: Schema.Types.ObjectId;
  whatsappLink?: string;
  sponsor_id?: Schema.Types.ObjectId;
  shortId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalidaSocialSchema = new Schema<ISalidaSocial>(
  {
    nombre: { type: String, required: true },
    ubicacion: { type: String },
    deporte: { type: String },
    fecha: { type: String },
    hora: { type: String },
    duracion: { type: String },
    descripcion: { type: String },
    localidad: { type: String },
    provincia: { type: String },
    telefonoOrganizador: { type: String },
    imagen: { type: String },
    locationCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    dificultad: {
      type: String,
      enum: Object.values(DificultadSalida),
    },
    precio: { type: String },
    cupo: { type: Number, required: true },
    cbu: { type: String },
    alias: { type: String },
    creador_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    whatsappLink: { type: String },
    sponsor_id: {
      type: Schema.Types.ObjectId,
      ref: "Sponsors",
    },
    shortId: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

const SalidaSocial = models.SalidaSocial || model<ISalidaSocial>("SalidaSocial", SalidaSocialSchema);
export default SalidaSocial;
