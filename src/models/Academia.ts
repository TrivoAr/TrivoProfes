import { Schema, model, models } from "mongoose";

export interface IAcademia {
  _id: string;
  dueño_id: Schema.Types.ObjectId;
  nombre_academia: string;
  pais: string;
  provincia: string;
  localidad: string;
  descripcion?: string;
  tipo_disciplina: "Running" | "Trekking" | "Ciclismo" | "Otros";
  telefono?: string;
  imagen?: string;
  clase_gratis: boolean;
  precio?: string;
  cbu?: string;
  alias?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AcademiaSchema = new Schema<IAcademia>(
  {
    dueño_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nombre_academia: { type: String, required: true },
    pais: { type: String, required: true },
    provincia: { type: String, required: true },
    localidad: { type: String, required: true },
    descripcion: { type: String },
    tipo_disciplina: {
      type: String,
      enum: ["Running", "Trekking", "Ciclismo", "Otros"],
      required: true,
    },
    telefono: { type: String },
    imagen: { type: String },
    clase_gratis: { type: Boolean, required: true },
    precio: { type: String },
    cbu: { type: String },
    alias: { type: String },
  },
  { timestamps: true }
);

const Academia = models.Academia || model<IAcademia>("Academia", AcademiaSchema);
export default Academia;
