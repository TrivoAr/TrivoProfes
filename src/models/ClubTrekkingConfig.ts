import { Schema, model, models } from "mongoose";

const ClubTrekkingConfigSchema = new Schema(
  {
    // Precio de suscripción mensual
    precioMensual: {
      type: Number,
      required: true,
      default: 25000,
    },

    // Precio máximo de salida que incluye la suscripción
    maxPrecioSalida: {
      type: Number,
      required: true,
      default: 10000,
    },

    // Límite de salidas por semana
    limiteSemanal: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
      max: 7,
    },

    // Radio de check-in en metros
    radioCheckIn: {
      type: Number,
      required: true,
      default: 100,
      min: 10,
      max: 1000,
    },

    // Deporte permitido para el club
    deportePermitido: {
      type: String,
      required: true,
      default: "Trekking",
    },

    // Estado del club (activo/inactivo)
    active: {
      type: Boolean,
      required: true,
      default: true,
    },

    // Usuario que actualizó la configuración
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Solo debería haber una configuración, por lo que usamos un singleton
ClubTrekkingConfigSchema.index({ _id: 1 }, { unique: true });

const ClubTrekkingConfig =
  models.ClubTrekkingConfig ||
  model("ClubTrekkingConfig", ClubTrekkingConfigSchema);

export default ClubTrekkingConfig;
