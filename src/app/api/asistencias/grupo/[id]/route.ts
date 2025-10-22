import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Asistencia from "@/models/Asistencia";
import Grupo from "@/models/Grupo";
import Academia from "@/models/Academia";

// GET /api/asistencias/grupo/[id] - Obtener asistencias de un grupo
export async function GET(
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

    // Verificar que el grupo existe
    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos (el usuario debe ser el dueño de la academia o admin)
    const academia = await Academia.findById(grupo.academia_id);
    if (!academia) {
      return NextResponse.json(
        { error: "Academia no encontrada" },
        { status: 404 }
      );
    }

    if (
      session.user.rol !== "admin" &&
      academia.dueño_id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para ver las asistencias de este grupo" },
        { status: 403 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(req.url);
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const userId = searchParams.get("userId");

    // Construir el filtro
    const filtro: any = {
      grupoId: id,
    };

    if (fechaDesde || fechaHasta) {
      filtro.fecha = {};
      if (fechaDesde) {
        filtro.fecha.$gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        filtro.fecha.$lte = new Date(fechaHasta);
      }
    }

    if (userId) {
      filtro.userId = userId;
    }

    // Obtener asistencias
    const asistencias = await Asistencia.find(filtro)
      .populate("userId", "firstname lastname email imagen")
      .populate("suscripcionId")
      .populate("registradoPor", "firstname lastname")
      .sort({ fecha: -1 });

    // Calcular estadísticas
    const estadisticas = {
      total: asistencias.length,
      asistenciasTrial: asistencias.filter((a) => a.esTrial).length,
      asistenciasPagas: asistencias.filter((a) => !a.esTrial).length,
      usuariosUnicos: new Set(asistencias.map((a) => a.userId.toString())).size,
    };

    // Agrupar por fecha
    const asistenciasPorFecha = asistencias.reduce((acc: any, asistencia) => {
      const fecha = new Date(asistencia.fecha).toISOString().split("T")[0];
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(asistencia);
      return acc;
    }, {});

    return NextResponse.json(
      {
        asistencias,
        estadisticas,
        asistenciasPorFecha,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error obteniendo asistencias del grupo:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}
