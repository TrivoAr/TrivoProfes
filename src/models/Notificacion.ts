import { Schema, model, models } from "mongoose";

export interface INotificacion {
  _id: string;
  userId: Schema.Types.ObjectId; // Usuario que recibe la notificación
  type:
    | "payment_pending" // Organizador: nuevo comprobante recibido
    | "joined_event" // Organizador: nuevo usuario quiere unirse
    | "pago_aprobado" // Usuario: su pago fue aprobado
    | "pago_rechazado"; // Usuario: su pago fue rechazado
  message: string; // Texto de la notificación
  read: boolean; // Si ya fue leída
  relatedId?: Schema.Types.ObjectId; // ID de salida, pago, etc.
  relatedUserId?: Schema.Types.ObjectId; // ID del usuario relacionado (quien se unió, etc.)
  metadata?: {
    salidaNombre?: string;
    userName?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificacionSchema = new Schema<INotificacion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index para queries rápidas
    },
    type: {
      type: String,
      enum: ["payment_pending", "joined_event", "pago_aprobado", "pago_rechazado"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // Index para filtrar no leídas
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: "onModel",
    },
    relatedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index compuesto para queries de notificaciones no leídas por usuario
NotificacionSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notificacion =
  models.Notificacion ||
  model<INotificacion>("Notificacion", NotificacionSchema);

export default Notificacion;
