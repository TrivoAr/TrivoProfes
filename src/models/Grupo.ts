import { Schema, model, models } from "mongoose";

export interface IGrupo {
  _id: string;
  academia_id: Schema.Types.ObjectId;
  profesor_id?: Schema.Types.ObjectId;
  nombre_grupo: string;
  nivel?: string;
  ubicacion?: string;
  horario?: string;
  dias: string[];
  descripcion?: string;
  imagen?: string;
  tipo_grupo?: string;
  tiempo_promedio?: string;
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GrupoSchema = new Schema<IGrupo>(
  {
    academia_id: {
      type: Schema.Types.ObjectId,
      ref: "Academia",
      required: true,
    },
    profesor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    nombre_grupo: {
      type: String,
      required: true,
    },
    nivel: {
      type: String,
    },
    ubicacion: {
      type: String,
    },
    horario: {
      type: String,
    },
    dias: {
      type: [String],
      enum: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
      required: true,
    },
    descripcion: {
      type: String,
    },
    imagen: {
      type: String,
    },
    tipo_grupo: {
      type: String,
    },
    tiempo_promedio: {
      type: String,
    },
    locationCoords: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Grupo = models.Grupo || model<IGrupo>("Grupo", GrupoSchema);
export default Grupo;
