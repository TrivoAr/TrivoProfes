import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // Mostrar solo las academias del usuario actual
    const academias = await Academia.find({ dueño_id: session.user.id })
      .populate("dueño_id", "firstname lastname email")
      .sort({ createdAt: -1 });

    return NextResponse.json(academias, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo academias:", error);
    return NextResponse.json({ error: "Error al obtener academias" }, { status: 500 });
  }
}

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

    // Verificar que el usuario no tenga ya una academia
    const academiaExistente = await Academia.findOne({ dueño_id: session.user.id });
    if (academiaExistente) {
      return NextResponse.json(
        { error: "Ya tienes una academia registrada. Solo puedes tener una academia por usuario." },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.nombre_academia || !body.pais || !body.provincia || !body.localidad || !body.tipo_disciplina || body.clase_gratis === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const nuevaAcademia = await Academia.create({
      ...body,
      dueño_id: session.user.id,
    });

    await nuevaAcademia.populate("dueño_id", "firstname lastname email");
    return NextResponse.json(nuevaAcademia, { status: 201 });
  } catch (error: any) {
    console.error("Error creando academia:", error);
    return NextResponse.json({ error: "Error al crear academia" }, { status: 500 });
  }
}
