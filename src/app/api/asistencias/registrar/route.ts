import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionService } from "@/services/subscriptionService";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";
import Grupo from "@/models/Grupo";

// POST /api/asistencias/registrar - Registrar asistencia de un usuario
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo profes, dueños de academia y admins pueden registrar asistencias
    if (!["admin", "profe", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { userId, academiaId, grupoId, fecha } = body;

    // Validaciones
    if (!userId || !academiaId || !grupoId) {
      return NextResponse.json(
        { error: "userId, academiaId y grupoId son requeridos" },
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

    // Verificar que el grupo existe y pertenece a la academia
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

    // Verificar permisos (el usuario debe ser el dueño de la academia o admin)
    if (
      session.user.rol !== "admin" &&
      academia.dueño_id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para registrar asistencias en esta academia" },
        { status: 403 }
      );
    }

    // Registrar la asistencia
    const resultado = await subscriptionService.registrarAsistencia({
      userId,
      academiaId,
      grupoId,
      fecha: fecha ? new Date(fecha) : undefined,
      registradoPor: session.user.id,
    });

    const response: any = {
      asistencia: resultado.asistencia,
      suscripcion: resultado.suscripcion,
      mensaje: "Asistencia registrada correctamente",
    };

    // Si el trial expiró, informar al frontend
    if (resultado.trialExpirado) {
      response.trialExpirado = true;
      response.requiereActivacion = true;
      response.mensaje = "Asistencia registrada. El periodo de prueba ha finalizado y requiere activación de pago.";
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Error registrando asistencia:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar asistencia" },
      { status: 500 }
    );
  }
}
