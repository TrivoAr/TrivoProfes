import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionService } from "@/services/subscriptionService";

// GET /api/subscriptions/user - Obtener todas las suscripciones del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const suscripciones = await subscriptionService.obtenerSuscripcionesUsuario(
      session.user.id
    );

    return NextResponse.json(
      {
        suscripciones,
        total: suscripciones.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error obteniendo suscripciones del usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener suscripciones" },
      { status: 500 }
    );
  }
}
