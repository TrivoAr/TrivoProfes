import { Schema, model, models } from "mongoose";

export interface IConfiguracionPagos {
  _id: string;
  // Información de pago por defecto
  precioPorDefecto?: string;
  cbuPorDefecto?: string;
  aliasPorDefecto?: string;
  // Precios por deporte
  preciosPorDeporte?: {
    Running?: string;
    Trekking?: string;
    Ciclismo?: string;
    Otros?: string;
  };
  // Configuración general
  permitirPagosGratis: boolean;
  // Metadatos
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConfiguracionPagosSchema = new Schema<IConfiguracionPagos>(
  {
    precioPorDefecto: { type: String },
    cbuPorDefecto: { type: String },
    aliasPorDefecto: { type: String },
    preciosPorDeporte: {
      Running: { type: String },
      Trekking: { type: String },
      Ciclismo: { type: String },
      Otros: { type: String },
    },
    permitirPagosGratis: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ConfiguracionPagos =
  models.ConfiguracionPagos ||
  model<IConfiguracionPagos>("ConfiguracionPagos", ConfiguracionPagosSchema);

export default ConfiguracionPagos;
