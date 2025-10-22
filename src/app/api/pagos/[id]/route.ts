import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Pago from "@/models/Pago";
import MiembroSalida from "@/models/MiembroSalida";
import Notificacion from "@/models/Notificacion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    if (!["aprobado", "rechazado"].includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const pago = await Pago.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    )
      .populate("userId", "firstname lastname email imagen")
      .populate("salidaId", "nombre shortId")
      .populate("academiaId", "nombre_academia");

    if (!pago) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    // Si hay una salida asociada, actualizar también el miembro
    if (pago.salidaId) {
      await MiembroSalida.updateMany(
        { pago_id: pago._id },
        { estado }
      );

      // Crear notificación para el usuario
      const notificationType =
        estado === "aprobado" ? "pago_aprobado" : "pago_rechazado";
      const notificationMessage =
        estado === "aprobado"
          ? `Tu pago para "${pago.salidaId.nombre}" fue aprobado ✅`
          : `Tu pago para "${pago.salidaId.nombre}" fue rechazado ❌`;

      await Notificacion.create({
        userId: pago.userId._id,
        type: notificationType,
        message: notificationMessage,
        relatedId: pago.salidaId._id,
        metadata: {
          salidaNombre: pago.salidaId.nombre,
          shortId: pago.salidaId.shortId, // Agregar shortId para navegación
        },
        read: false,
      });

      // TODO: Si estado === "aprobado", generar QR y enviar email (Fase 2)
    }

    return NextResponse.json(
      {
        success: true,
        message: `Pago ${estado} exitosamente`,
        pago,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error actualizando pago:", error);
    return NextResponse.json(
      { error: "Error al actualizar pago", details: error.message },
      { status: 500 }
    );
  }
}
