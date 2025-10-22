import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Notificacion from "@/models/Notificacion";

// GET /api/notificaciones - Obtener notificaciones del usuario actual
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = { userId: session.user.id };
    if (unreadOnly) {
      query.read = false;
    }

    const notificaciones = await Notificacion.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Contar notificaciones no leídas
    const unreadCount = await Notificacion.countDocuments({
      userId: session.user.id,
      read: false,
    });

    return NextResponse.json(
      {
        notificaciones: JSON.parse(JSON.stringify(notificaciones)),
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/notificaciones - Crear una notificación (uso interno)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { userId, type, message, relatedId, relatedUserId, metadata } = body;

    // Validar campos requeridos
    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const notificacion = await Notificacion.create({
      userId,
      type,
      message,
      relatedId,
      relatedUserId,
      metadata: metadata || {},
      read: false,
    });

    return NextResponse.json(
      {
        success: true,
        notificacion: JSON.parse(JSON.stringify(notificacion)),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear notificación:", error);
    return NextResponse.json(
      { error: "Error al crear notificación", details: error.message },
      { status: 500 }
    );
  }
}
