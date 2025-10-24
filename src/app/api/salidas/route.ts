import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

// GET /api/salidas - Listar salidas del usuario logueado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // Filtrar salidas por el usuario creador
    const salidas = await SalidaSocial.find({ creador_id: session.user.id })
      .populate("creador_id", "firstname lastname email")
      .sort({ createdAt: -1 });

    // Obtener conteo de miembros aprobados para cada salida
    const salidasConMiembros = await Promise.all(
      salidas.map(async (salida) => {
        const miembrosAprobados = await MiembroSalida.countDocuments({
          salida_id: salida._id,
          estado: "aprobado",
        });

        return {
          ...salida.toObject(),
          participantes: miembrosAprobados,
        };
      })
    );

    return NextResponse.json(salidasConMiembros, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo salidas:", error);
    return NextResponse.json(
      { error: "Error al obtener salidas" },
      { status: 500 }
    );
  }
}

// POST /api/salidas - Crear nueva salida
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin o profe pueden crear
    if (!["admin", "profe"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();

    // Validación básica
    if (!body.nombre || !body.cupo) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre y cupo" },
        { status: 400 }
      );
    }

    // Generar shortId único
    const shortId = nanoid();

    const nuevaSalida = await SalidaSocial.create({
      ...body,
      creador_id: session.user.id,
      shortId,
    });

    // Poblar datos del creador
    await nuevaSalida.populate("creador_id", "firstname lastname email");

    return NextResponse.json(nuevaSalida, { status: 201 });
  } catch (error: any) {
    console.error("Error creando salida:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Ya existe una salida con ese shortId" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear salida" },
      { status: 500 }
    );
  }
}
