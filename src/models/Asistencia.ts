import { Schema, model, models } from "mongoose";

export interface IAsistencia {
  _id: string;
  userId: Schema.Types.ObjectId;
  academiaId: Schema.Types.ObjectId;
  grupoId: Schema.Types.ObjectId;
  suscripcionId: Schema.Types.ObjectId;

  fecha: Date;
  asistio: boolean;
  esTrial: boolean;
  notas?: string;
  registradoPor: Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const AsistenciaSchema = new Schema<IAsistencia>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academiaId: {
      type: Schema.Types.ObjectId,
      ref: "Academia",
      required: true,
    },
    grupoId: {
      type: Schema.Types.ObjectId,
      ref: "Grupo",
      required: true,
    },
    suscripcionId: {
      type: Schema.Types.ObjectId,
      ref: "Suscripcion",
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
      default: Date.now,
    },
    asistio: {
      type: Boolean,
      required: true,
      default: true,
    },
    esTrial: {
      type: Boolean,
      required: true,
      default: false,
    },
    notas: {
      type: String,
    },
    registradoPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Índices para búsquedas rápidas
AsistenciaSchema.index({ userId: 1, fecha: -1 });
AsistenciaSchema.index({ grupoId: 1, fecha: -1 });
AsistenciaSchema.index({ suscripcionId: 1 });
AsistenciaSchema.index({ academiaId: 1 });

const Asistencia =
  models.Asistencia || model<IAsistencia>("Asistencia", AsistenciaSchema);
export default Asistencia;
