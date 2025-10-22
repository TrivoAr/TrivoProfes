import { Schema, model, models } from "mongoose";

export interface IMiembroAcademia {
  _id: string;
  usuario_id: Schema.Types.ObjectId;
  academia_id: Schema.Types.ObjectId;
  grupo_id?: Schema.Types.ObjectId;
  fecha_union: Date;
  estado: "activo" | "inactivo" | "suspendido";
  tipo_membresia?: "mensual" | "trimestral" | "semestral" | "anual";
  fecha_vencimiento?: Date;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MiembroAcademiaSchema = new Schema<IMiembroAcademia>(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academia_id: {
      type: Schema.Types.ObjectId,
      ref: "Academia",
      required: true,
    },
    grupo_id: {
      type: Schema.Types.ObjectId,
      ref: "Grupo",
    },
    fecha_union: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo", "suspendido"],
      default: "activo",
    },
    tipo_membresia: {
      type: String,
      enum: ["mensual", "trimestral", "semestral", "anual"],
    },
    fecha_vencimiento: {
      type: Date,
    },
    notas: {
      type: String,
    },
  },
  { timestamps: true }
);

// Índice para evitar duplicados
MiembroAcademiaSchema.index({ usuario_id: 1, academia_id: 1 }, { unique: true });

const MiembroAcademia =
  models.MiembroAcademia || model<IMiembroAcademia>("MiembroAcademia", MiembroAcademiaSchema);
export default MiembroAcademia;
