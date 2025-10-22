import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionService } from "@/services/subscriptionService";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";
import Grupo from "@/models/Grupo";

// POST /api/subscriptions/create - Crear una nueva suscripción
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { academiaId, grupoId } = body;

    if (!academiaId) {
      return NextResponse.json(
        { error: "academiaId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la academia existe
    const academia = await Academia.findById(academiaId);
    if (!academia) {
      return NextResponse.json(
        { error: "Academia no encontrada" },
        { status: 404 }
      );
    }

    // Si se proporciona grupoId, verificar que existe y pertenece a la academia
    if (grupoId) {
      const grupo = await Grupo.findById(grupoId);
      if (!grupo) {
        return NextResponse.json(
          { error: "Grupo no encontrado" },
          { status: 404 }
        );
      }
      if (grupo.academia_id.toString() !== academiaId) {
        return NextResponse.json(
          { error: "El grupo no pertenece a esta academia" },
          { status: 400 }
        );
      }
    }

    // Verificar si ya tiene una suscripción activa
    const suscripcionExistente = await subscriptionService.obtenerSuscripcionActiva(
      session.user.id,
      academiaId
    );

    if (suscripcionExistente) {
      return NextResponse.json(
        {
          error: "Ya tienes una suscripción activa en esta academia",
          suscripcion: suscripcionExistente,
        },
        { status: 400 }
      );
    }

    // Crear la suscripción
    const { suscripcion, requiereConfiguracionPago } =
      await subscriptionService.crearSuscripcion({
        userId: session.user.id,
        academiaId,
        grupoId,
        monto: academia.precio || 0,
      });

    // Si está en trial, marcar en el usuario
    if (suscripcion.trial?.estaEnTrial) {
      const User = (await import("@/models/User")).default;
      const user = await User.findById(session.user.id);

      if (user) {
        // Actualizar trialConfig según el tipo de trial
        const SUBSCRIPTION_CONFIG = (await import("@/lib/constants/subscription.config")).SUBSCRIPTION_CONFIG;

        if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "global") {
          user.trialConfig = user.trialConfig || {};
          user.trialConfig.haUsadoTrial = true;
        } else if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "por-academia") {
          user.trialConfig = user.trialConfig || { haUsadoTrial: false, academiasConTrial: [] };
          if (!user.trialConfig.academiasConTrial.includes(academiaId)) {
            user.trialConfig.academiasConTrial.push(academiaId);
          }
        }

        await user.save();
      }
    }

    return NextResponse.json(
      {
        suscripcion,
        requiereConfiguracionPago,
        mensaje: requiereConfiguracionPago
          ? "Debes configurar el pago para activar tu suscripción"
          : "Tu periodo de prueba ha comenzado",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear suscripción" },
      { status: 500 }
    );
  }
}
