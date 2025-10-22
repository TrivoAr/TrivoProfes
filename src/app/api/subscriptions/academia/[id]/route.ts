import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionService } from "@/services/subscriptionService";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";

// GET /api/subscriptions/academia/[id] - Obtener todas las suscripciones de una academia
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Verificar que la academia existe
    const academia = await Academia.findById(id);
    if (!academia) {
      return NextResponse.json(
        { error: "Academia no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el dueño de la academia o admin)
    if (
      session.user.rol !== "admin" &&
      academia.dueño_id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para ver las suscripciones de esta academia" },
        { status: 403 }
      );
    }

    const suscripciones = await subscriptionService.obtenerSuscripcionesAcademia(id);

    // Contar suscripciones por estado
    const estadisticas = {
      total: suscripciones.length,
      trial: suscripciones.filter((s) => s.estado === "trial").length,
      activas: suscripciones.filter((s) => s.estado === "activa").length,
      trial_expirado: suscripciones.filter((s) => s.estado === "trial_expirado").length,
      pendientes: suscripciones.filter((s) => s.estado === "pendiente").length,
      vencidas: suscripciones.filter((s) => s.estado === "vencida").length,
      pausadas: suscripciones.filter((s) => s.estado === "pausada").length,
      canceladas: suscripciones.filter((s) => s.estado === "cancelada").length,
    };

    return NextResponse.json(
      {
        suscripciones,
        estadisticas,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error obteniendo suscripciones de la academia:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener suscripciones" },
      { status: 500 }
    );
  }
}
