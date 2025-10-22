import { Schema, model, models } from "mongoose";

export interface IPago {
  _id: string;
  salidaId?: Schema.Types.ObjectId;
  academiaId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  comprobanteUrl?: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  amount?: number;
  tipoPago: "transferencia" | "mercadopago";
  // Campos adicionales para tracking (persistirán aunque se borre la salida)
  salidaNombre?: string;
  academiaNombre?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PagoSchema = new Schema<IPago>(
  {
    salidaId: {
      type: Schema.Types.ObjectId,
      ref: "SalidaSocial",
      required: false,
    },
    academiaId: {
      type: Schema.Types.ObjectId,
      ref: "Academia",
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comprobanteUrl: { type: String },
    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado"],
      default: "pendiente",
    },
    amount: { type: Number },
    tipoPago: {
      type: String,
      enum: ["transferencia", "mercadopago"],
      default: "transferencia",
    },
    salidaNombre: { type: String },
    academiaNombre: { type: String },
  },
  { timestamps: true }
);

const Pago = models.Pago || model<IPago>("Pago", PagoSchema);
export default Pago;
