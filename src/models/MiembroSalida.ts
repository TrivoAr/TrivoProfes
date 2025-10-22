import { Schema, model, models } from "mongoose";

export interface IMiembroSalida {
  _id: string;
  usuario_id: Schema.Types.ObjectId;
  salida_id: Schema.Types.ObjectId;
  fecha_union: Date;
  rol: "miembro" | "organizador";
  estado: "pendiente" | "aprobado" | "rechazado";
  pago_id?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MiembroSalidaSchema = new Schema<IMiembroSalida>(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salida_id: {
      type: Schema.Types.ObjectId,
      ref: "SalidaSocial",
      required: true,
    },
    fecha_union: { type: Date, default: Date.now },
    rol: {
      type: String,
      enum: ["miembro", "organizador"],
      default: "miembro",
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado"],
      default: "pendiente",
    },
    pago_id: { type: Schema.Types.ObjectId, ref: "Pago" },
  },
  { timestamps: true }
);

const MiembroSalida = models.MiembroSalida || model<IMiembroSalida>("MiembroSalida", MiembroSalidaSchema);
export default MiembroSalida;
