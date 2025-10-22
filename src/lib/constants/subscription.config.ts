export const SUBSCRIPTION_CONFIG = {
  TRIAL: {
    TYPE: "global" as "global" | "por-academia", // Si puede tener trial una vez en la vida o por academia
    MAX_CLASES_GRATIS: 1, // Número de clases gratis en el trial
    MAX_DIAS_GRATIS: 7, // Días de trial gratuito
    ENABLED: true, // Si el trial está habilitado
  },

  SUBSCRIPTION: {
    FREQUENCY: 1,
    FREQUENCY_TYPE: "months",
    CURRENCY: "ARS",
    MIN_AMOUNT: 15, // Mínimo requerido por MercadoPago
  },

  ESTADOS: {
    TRIAL: "trial" as const, // En período de prueba
    TRIAL_EXPIRADO: "trial_expirado" as const, // Trial terminado, esperando pago
    PENDIENTE: "pendiente" as const, // Esperando aprobación de pago
    ACTIVA: "activa" as const, // Suscripción activa y pagada
    VENCIDA: "vencida" as const, // Pago rechazado
    PAUSADA: "pausada" as const,
    CANCELADA: "cancelada" as const,
  },
} as const;

export type EstadoSuscripcion = typeof SUBSCRIPTION_CONFIG.ESTADOS[keyof typeof SUBSCRIPTION_CONFIG.ESTADOS];
