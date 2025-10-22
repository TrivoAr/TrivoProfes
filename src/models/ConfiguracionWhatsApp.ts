import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConfiguracionWhatsApp extends Document {
  _id: string;
  gruposPorDeporte?: {
    Running?: string;
    Trekking?: string;
    Ciclismo?: string;
    Otros?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConfiguracionWhatsAppSchema = new Schema<IConfiguracionWhatsApp>(
  {
    gruposPorDeporte: {
      type: {
        Running: { type: String },
        Trekking: { type: String },
        Ciclismo: { type: String },
        Otros: { type: String },
      },
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConfiguracionWhatsApp: Model<IConfiguracionWhatsApp> =
  mongoose.models.ConfiguracionWhatsApp ||
  mongoose.model<IConfiguracionWhatsApp>(
    "ConfiguracionWhatsApp",
    ConfiguracionWhatsAppSchema
  );

export default ConfiguracionWhatsApp;
