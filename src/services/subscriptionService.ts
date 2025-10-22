import { connectDB } from "@/lib/mongodb";
import Suscripcion from "@/models/Suscripcion";
import Asistencia from "@/models/Asistencia";
import User from "@/models/User";
import Academia from "@/models/Academia";
import { SUBSCRIPTION_CONFIG } from "@/lib/constants/subscription.config";

export const subscriptionService = {
  /**
   * Verifica si el usuario puede usar el trial
   */
  async verificarElegibilidadTrial(
    userId: string,
    academiaId: string
  ): Promise<{
    puedeUsarTrial: boolean;
    razon?: string;
    yaUsoTrial: boolean;
  }> {
    try {
      await connectDB();

      if (!SUBSCRIPTION_CONFIG.TRIAL.ENABLED) {
        return {
          puedeUsarTrial: false,
          razon: "El trial no está habilitado",
          yaUsoTrial: false,
        };
      }

      const user = await User.findById(userId);
      if (!user) {
        return {
          puedeUsarTrial: false,
          razon: "Usuario no encontrado",
          yaUsoTrial: false,
        };
      }

      // Tipo GLOBAL: solo puede usar el trial una vez en la vida
      if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "global") {
        if (user.trialConfig?.haUsadoTrial) {
          return {
            puedeUsarTrial: false,
            razon: "Ya has usado tu trial gratuito",
            yaUsoTrial: true,
          };
        }
      }

      // Tipo POR-ACADEMIA: puede usar el trial una vez por academia
      if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "por-academia") {
        const academiasConTrial = user.trialConfig?.academiasConTrial || [];
        if (academiasConTrial.includes(academiaId)) {
          return {
            puedeUsarTrial: false,
            razon: "Ya has usado el trial en esta academia",
            yaUsoTrial: true,
          };
        }
      }

      return {
        puedeUsarTrial: true,
        yaUsoTrial: false,
      };
    } catch (error) {
      console.error("Error verificando elegibilidad trial:", error);
      return {
        puedeUsarTrial: false,
        razon: "Error al verificar elegibilidad",
        yaUsoTrial: false,
      };
    }
  },

  /**
   * Crea una nueva suscripción
   */
  async crearSuscripcion({
    userId,
    academiaId,
    grupoId,
    monto,
  }: {
    userId: string;
    academiaId: string;
    grupoId?: string;
    monto: number;
  }): Promise<{
    suscripcion: any;
    requiereConfiguracionPago: boolean;
  }> {
    try {
      await connectDB();

      // Verificar elegibilidad para trial
      const { puedeUsarTrial, yaUsoTrial } = await this.verificarElegibilidadTrial(
        userId,
        academiaId
      );

      let dataSuscripcion: any = {
        userId,
        academiaId,
        grupoId,
        pagos: {
          monto,
          moneda: SUBSCRIPTION_CONFIG.SUBSCRIPTION.CURRENCY,
          frecuencia: SUBSCRIPTION_CONFIG.SUBSCRIPTION.FREQUENCY,
          tipoFrecuencia: SUBSCRIPTION_CONFIG.SUBSCRIPTION.FREQUENCY_TYPE,
        },
      };

      if (puedeUsarTrial && !yaUsoTrial) {
        // CON TRIAL
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + SUBSCRIPTION_CONFIG.TRIAL.MAX_DIAS_GRATIS);

        dataSuscripcion.estado = SUBSCRIPTION_CONFIG.ESTADOS.TRIAL;
        dataSuscripcion.trial = {
          estaEnTrial: true,
          fechaInicio,
          fechaFin,
          clasesAsistidas: 0,
          fueUsado: false,
        };

        const suscripcion = await Suscripcion.create(dataSuscripcion);

        return {
          suscripcion,
          requiereConfiguracionPago: false,
        };
      } else {
        // SIN TRIAL - Necesita pagar de inmediato
        dataSuscripcion.estado = SUBSCRIPTION_CONFIG.ESTADOS.ACTIVA;
        dataSuscripcion.trial = {
          estaEnTrial: false,
          clasesAsistidas: 0,
          fueUsado: yaUsoTrial,
        };

        const suscripcion = await Suscripcion.create(dataSuscripcion);

        return {
          suscripcion,
          requiereConfiguracionPago: true,
        };
      }
    } catch (error) {
      console.error("Error creando suscripción:", error);
      throw error;
    }
  },

  /**
   * Obtiene la suscripción activa de un usuario en una academia
   */
  async obtenerSuscripcionActiva(
    userId: string,
    academiaId: string
  ): Promise<any | null> {
    try {
      await connectDB();

      const suscripcion = await Suscripcion.findOne({
        userId,
        academiaId,
        estado: {
          $in: [
            SUBSCRIPTION_CONFIG.ESTADOS.TRIAL,
            SUBSCRIPTION_CONFIG.ESTADOS.ACTIVA,
            SUBSCRIPTION_CONFIG.ESTADOS.TRIAL_EXPIRADO,
          ],
        },
      })
        .populate("userId", "firstname lastname email imagen")
        .populate("academiaId", "nombre_academia")
        .populate("grupoId", "nombre_grupo");

      return suscripcion;
    } catch (error) {
      console.error("Error obteniendo suscripción activa:", error);
      return null;
    }
  },

  /**
   * Verifica si el trial ha expirado (modelo híbrido)
   */
  verificarTrialExpirado(suscripcion: any): boolean {
    if (!suscripcion.trial?.estaEnTrial) {
      return false;
    }

    const ahora = new Date();

    // Condición 1: Alcanzó el máximo de clases gratis
    if (
      suscripcion.trial.clasesAsistidas >= SUBSCRIPTION_CONFIG.TRIAL.MAX_CLASES_GRATIS
    ) {
      return true;
    }

    // Condición 2: Pasaron los días gratis
    if (suscripcion.trial.fechaFin && ahora > new Date(suscripcion.trial.fechaFin)) {
      return true;
    }

    return false;
  },

  /**
   * Registra una asistencia y maneja la lógica del trial
   */
  async registrarAsistencia({
    userId,
    academiaId,
    grupoId,
    fecha,
    registradoPor,
  }: {
    userId: string;
    academiaId: string;
    grupoId: string;
    fecha?: Date;
    registradoPor: string;
  }): Promise<{
    asistencia: any;
    requiereActivacion: boolean;
    suscripcion: any;
    trialExpirado?: boolean;
  }> {
    try {
      await connectDB();

      // Obtener suscripción activa
      const suscripcion = await this.obtenerSuscripcionActiva(userId, academiaId);

      if (!suscripcion) {
        throw new Error("No se encontró una suscripción activa");
      }

      const fechaAsistencia = fecha || new Date();
      const esTrial = suscripcion.trial?.estaEnTrial || false;

      // Crear registro de asistencia
      const asistencia = await Asistencia.create({
        userId,
        academiaId,
        grupoId,
        suscripcionId: suscripcion._id,
        fecha: fechaAsistencia,
        asistio: true,
        esTrial,
        registradoPor,
      });

      // Si está en trial, incrementar contador
      if (esTrial) {
        suscripcion.trial.clasesAsistidas += 1;
        await suscripcion.save();

        // Verificar si el trial expiró
        const trialExpirado = this.verificarTrialExpirado(suscripcion);

        if (trialExpirado) {
          // Cambiar estado a trial_expirado
          suscripcion.estado = SUBSCRIPTION_CONFIG.ESTADOS.TRIAL_EXPIRADO;
          suscripcion.trial.estaEnTrial = false;
          await suscripcion.save();

          return {
            asistencia,
            requiereActivacion: true,
            suscripcion,
            trialExpirado: true,
          };
        }
      }

      return {
        asistencia,
        requiereActivacion: false,
        suscripcion,
      };
    } catch (error) {
      console.error("Error registrando asistencia:", error);
      throw error;
    }
  },

  /**
   * Obtiene las suscripciones de un usuario
   */
  async obtenerSuscripcionesUsuario(userId: string): Promise<any[]> {
    try {
      await connectDB();

      const suscripciones = await Suscripcion.find({ userId })
        .populate("academiaId", "nombre_academia imagen")
        .populate("grupoId", "nombre_grupo")
        .sort({ createdAt: -1 });

      return suscripciones;
    } catch (error) {
      console.error("Error obteniendo suscripciones del usuario:", error);
      return [];
    }
  },

  /**
   * Obtiene estadísticas de asistencia
   */
  async obtenerEstadisticasAsistencia(
    userId: string,
    suscripcionId: string
  ): Promise<{
    totalAsistencias: number;
    asistenciasTrial: number;
    asistenciasPagas: number;
  }> {
    try {
      await connectDB();

      const asistencias = await Asistencia.find({
        userId,
        suscripcionId,
        asistio: true,
      });

      const totalAsistencias = asistencias.length;
      const asistenciasTrial = asistencias.filter((a) => a.esTrial).length;
      const asistenciasPagas = asistencias.filter((a) => !a.esTrial).length;

      return {
        totalAsistencias,
        asistenciasTrial,
        asistenciasPagas,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return {
        totalAsistencias: 0,
        asistenciasTrial: 0,
        asistenciasPagas: 0,
      };
    }
  },

  /**
   * Obtiene las suscripciones de una academia
   */
  async obtenerSuscripcionesAcademia(academiaId: string): Promise<any[]> {
    try {
      await connectDB();

      const suscripciones = await Suscripcion.find({ academiaId })
        .populate("userId", "firstname lastname email imagen telnumber")
        .populate("grupoId", "nombre_grupo")
        .sort({ createdAt: -1 });

      return suscripciones;
    } catch (error) {
      console.error("Error obteniendo suscripciones de la academia:", error);
      return [];
    }
  },
};
