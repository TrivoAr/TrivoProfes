import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import { createShortId } from "@/lib/nanoid";

// GET /api/salidas - Listar salidas del usuario logueado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // DEBUG: Log para producción
    console.log("[DEBUG] User ID:", session.user.id);
    console.log("[DEBUG] User ID type:", typeof session.user.id);

    // Primero verificar si hay salidas en general
    const totalSalidas = await SalidaSocial.countDocuments();
    console.log("[DEBUG] Total salidas en DB:", totalSalidas);

    // Verificar salidas del usuario
    const salidasCount = await SalidaSocial.countDocuments({ creador_id: session.user.id });
    console.log("[DEBUG] Salidas del usuario:", salidasCount);

    // Si hay salidas pero ninguna del usuario, mostrar algunos IDs para comparar
    if (totalSalidas > 0 && salidasCount === 0) {
      const sampleSalida = await SalidaSocial.findOne().select('creador_id').lean();
      console.log("[DEBUG] Sample creador_id:", sampleSalida?.creador_id);
      console.log("[DEBUG] Sample creador_id type:", typeof sampleSalida?.creador_id);
    }

    // Filtrar salidas por el usuario creador
    const salidas = await SalidaSocial.find({ creador_id: session.user.id })
      .populate("creador_id", "firstname lastname email")
      .sort({ createdAt: -1 });

    console.log("[DEBUG] Salidas encontradas:", salidas.length);

    // Obtener conteo de pagos aprobados para cada salida
    const salidasConMiembros = await Promise.all(
      salidas.map(async (salida) => {
        // Obtener miembros con pagos aprobados
        const miembrosConPago = await MiembroSalida.find({
          salida_id: salida._id,
        }).populate('pago_id').lean();

        const miembrosAprobados = miembrosConPago.filter(
          (miembro: any) => miembro.pago_id && miembro.pago_id.estado === 'aprobado'
        ).length;

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
    const shortId = createShortId();

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
