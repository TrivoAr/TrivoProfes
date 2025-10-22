import { Schema, model, models } from "mongoose";

export interface ISuscripcion {
  _id: string;
  userId: Schema.Types.ObjectId;
  academiaId: Schema.Types.ObjectId;
  grupoId?: Schema.Types.ObjectId;

  // Estado de la suscripción
  estado: "trial" | "trial_expirado" | "pendiente" | "activa" | "vencida" | "pausada" | "cancelada";

  // Sistema de Trial (Modelo Híbrido)
  trial: {
    estaEnTrial: boolean;
    fechaInicio?: Date;
    fechaFin?: Date;
    clasesAsistidas: number;
    fueUsado: boolean;
  };

  // Integración con MercadoPago
  mercadoPago?: {
    preapprovalId?: string;
    initPoint?: string;
    status?: string;
    payerId?: string;
    payerEmail?: string;
  };

  // Información de pagos
  pagos: {
    monto: number;
    moneda: string;
    frecuencia: number;
    tipoFrecuencia: string;
    proximaFechaPago?: Date;
    ultimaFechaPago?: Date;
  };

  fechaCancelacion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuscripcionSchema = new Schema<ISuscripcion>(
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
    },
    estado: {
      type: String,
      enum: ["trial", "trial_expirado", "pendiente", "activa", "vencida", "pausada", "cancelada"],
      required: true,
      default: "trial",
    },
    trial: {
      estaEnTrial: {
        type: Boolean,
        default: false,
      },
      fechaInicio: {
        type: Date,
      },
      fechaFin: {
        type: Date,
      },
      clasesAsistidas: {
        type: Number,
        default: 0,
      },
      fueUsado: {
        type: Boolean,
        default: false,
      },
    },
    mercadoPago: {
      preapprovalId: { type: String },
      initPoint: { type: String },
      status: { type: String },
      payerId: { type: String },
      payerEmail: { type: String },
    },
    pagos: {
      monto: {
        type: Number,
        required: true,
      },
      moneda: {
        type: String,
        default: "ARS",
      },
      frecuencia: {
        type: Number,
        default: 1,
      },
      tipoFrecuencia: {
        type: String,
        default: "months",
      },
      proximaFechaPago: {
        type: Date,
      },
      ultimaFechaPago: {
        type: Date,
      },
    },
    fechaCancelacion: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Índice para búsquedas rápidas
SuscripcionSchema.index({ userId: 1, academiaId: 1 });
SuscripcionSchema.index({ estado: 1 });
SuscripcionSchema.index({ "mercadoPago.preapprovalId": 1 });

const Suscripcion =
  models.Suscripcion || model<ISuscripcion>("Suscripcion", SuscripcionSchema);
export default Suscripcion;
