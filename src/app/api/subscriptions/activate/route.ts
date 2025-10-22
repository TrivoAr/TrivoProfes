import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Suscripcion from "@/models/Suscripcion";
import User from "@/models/User";
import { SUBSCRIPTION_CONFIG } from "@/lib/constants/subscription.config";

// POST /api/subscriptions/activate - Activar una suscripción después de configurar el pago
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { suscripcionId, mercadoPagoData } = body;

    if (!suscripcionId) {
      return NextResponse.json(
        { error: "suscripcionId es requerido" },
        { status: 400 }
      );
    }

    // Obtener la suscripción
    const suscripcion = await Suscripcion.findById(suscripcionId);
    if (!suscripcion) {
      return NextResponse.json(
        { error: "Suscripción no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    if (suscripcion.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para activar esta suscripción" },
        { status: 403 }
      );
    }

    // Verificar que la suscripción está en estado correcto
    if (
      ![
        SUBSCRIPTION_CONFIG.ESTADOS.TRIAL_EXPIRADO,
        SUBSCRIPTION_CONFIG.ESTADOS.PENDIENTE,
      ].includes(suscripcion.estado)
    ) {
      return NextResponse.json(
        {
          error: `No se puede activar una suscripción en estado ${suscripcion.estado}`,
        },
        { status: 400 }
      );
    }

    // Actualizar con datos de MercadoPago
    if (mercadoPagoData) {
      suscripcion.mercadoPago = {
        preapprovalId: mercadoPagoData.preapprovalId,
        initPoint: mercadoPagoData.initPoint,
        status: mercadoPagoData.status || "pending",
        payerId: mercadoPagoData.payerId,
        payerEmail: mercadoPagoData.payerEmail,
      };
    }

    // Activar la suscripción
    suscripcion.estado = SUBSCRIPTION_CONFIG.ESTADOS.ACTIVA;

    // Marcar trial como usado
    if (suscripcion.trial?.fueUsado === false) {
      suscripcion.trial.fueUsado = true;
      suscripcion.trial.estaEnTrial = false;

      // Actualizar el usuario para marcar que usó el trial
      const user = await User.findById(session.user.id);
      if (user) {
        if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "global") {
          user.trialConfig = user.trialConfig || {};
          user.trialConfig.haUsadoTrial = true;
        } else if (SUBSCRIPTION_CONFIG.TRIAL.TYPE === "por-academia") {
          user.trialConfig = user.trialConfig || {
            haUsadoTrial: false,
            academiasConTrial: [],
          };
          if (
            !user.trialConfig.academiasConTrial.includes(
              suscripcion.academiaId.toString()
            )
          ) {
            user.trialConfig.academiasConTrial.push(
              suscripcion.academiaId.toString()
            );
          }
        }
        await user.save();
      }
    }

    // Establecer la próxima fecha de pago
    const ahora = new Date();
    suscripcion.pagos.proximaFechaPago = new Date(
      ahora.setMonth(
        ahora.getMonth() + suscripcion.pagos.frecuencia
      )
    );
    suscripcion.pagos.ultimaFechaPago = new Date();

    await suscripcion.save();

    return NextResponse.json(
      {
        suscripcion,
        mensaje: "Suscripción activada correctamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error activando suscripción:", error);
    return NextResponse.json(
      { error: error.message || "Error al activar suscripción" },
      { status: 500 }
    );
  }
}
