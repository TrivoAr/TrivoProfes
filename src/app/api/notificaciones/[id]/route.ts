import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Notificacion from "@/models/Notificacion";

// PATCH /api/notificaciones/[id] - Marcar notificación como leída
export async function PATCH(
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
    const body = await req.json();
    const { read } = body;

    // Verificar que la notificación pertenece al usuario
    const notificacion = await Notificacion.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar estado de lectura
    notificacion.read = read !== undefined ? read : true;
    await notificacion.save();

    return NextResponse.json(
      {
        success: true,
        notificacion: JSON.parse(JSON.stringify(notificacion)),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar notificación:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificación", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/notificaciones/[id] - Eliminar notificación
export async function DELETE(
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

    // Verificar que la notificación pertenece al usuario
    const notificacion = await Notificacion.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Notificación eliminada" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al eliminar notificación:", error);
    return NextResponse.json(
      { error: "Error al eliminar notificación", details: error.message },
      { status: 500 }
    );
  }
}
