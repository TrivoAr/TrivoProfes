import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Grupo from "@/models/Grupo";
import Academia from "@/models/Academia";

// GET /api/grupos?academia_id=xxx - Obtener grupos de una academia
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const academia_id = searchParams.get("academia_id");

    if (!academia_id) {
      return NextResponse.json(
        { error: "Se requiere academia_id" },
        { status: 400 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para ver los grupos de esta academia" },
          { status: 403 }
        );
      }
    }

    const grupos = await Grupo.find({ academia_id })
      .populate("profesor_id", "firstname lastname email imagen")
      .sort({ createdAt: -1 });

    return NextResponse.json(grupos, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo grupos:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos" },
      { status: 500 }
    );
  }
}

// POST /api/grupos - Crear nuevo grupo
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    // Validar campos requeridos
    if (!body.academia_id || !body.nombre_grupo || !body.dias || body.dias.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: academia_id, nombre_grupo, dias" },
        { status: 400 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(body.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para crear grupos en esta academia" },
          { status: 403 }
        );
      }
    }

    const nuevoGrupo = await Grupo.create(body);
    await nuevoGrupo.populate("profesor_id", "firstname lastname email imagen");

    return NextResponse.json(nuevoGrupo, { status: 201 });
  } catch (error: any) {
    console.error("Error creando grupo:", error);
    return NextResponse.json(
      { error: "Error al crear grupo" },
      { status: 500 }
    );
  }
}
