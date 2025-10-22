import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import MiembroAcademia from "@/models/MiembroAcademia";
import Academia from "@/models/Academia";

// GET /api/miembros-academia?academia_id=xxx - Obtener miembros de una academia
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
          { error: "No tienes permisos para ver los miembros de esta academia" },
          { status: 403 }
        );
      }
    }

    const miembros = await MiembroAcademia.find({ academia_id })
      .populate("usuario_id", "firstname lastname email imagen telnumber")
      .populate("grupo_id", "nombre_grupo")
      .sort({ createdAt: -1 });

    return NextResponse.json(miembros, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembros:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}

// POST /api/miembros-academia - Agregar nuevo miembro
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
    if (!body.academia_id || !body.usuario_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: academia_id, usuario_id" },
        { status: 400 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(body.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para agregar miembros a esta academia" },
          { status: 403 }
        );
      }
    }

    // Verificar si el miembro ya existe
    const miembroExistente = await MiembroAcademia.findOne({
      usuario_id: body.usuario_id,
      academia_id: body.academia_id,
    });

    if (miembroExistente) {
      return NextResponse.json(
        { error: "Este usuario ya es miembro de la academia" },
        { status: 400 }
      );
    }

    const nuevoMiembro = await MiembroAcademia.create(body);
    await nuevoMiembro.populate("usuario_id", "firstname lastname email imagen telnumber");
    await nuevoMiembro.populate("grupo_id", "nombre_grupo");

    return NextResponse.json(nuevoMiembro, { status: 201 });
  } catch (error: any) {
    console.error("Error creando miembro:", error);

    // Manejar error de índice único
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Este usuario ya es miembro de la academia" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear miembro" },
      { status: 500 }
    );
  }
}
