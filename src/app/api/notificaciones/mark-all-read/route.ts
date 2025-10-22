import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Notificacion from "@/models/Notificacion";

// POST /api/notificaciones/mark-all-read - Marcar todas como leídas
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const result = await Notificacion.updateMany(
      { userId: session.user.id, read: false },
      { read: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
        count: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al marcar todas como leídas:", error);
    return NextResponse.json(
      { error: "Error al marcar notificaciones", details: error.message },
      { status: 500 }
    );
  }
}
