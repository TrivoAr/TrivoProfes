import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Grupo from "@/models/Grupo";
import MiembroAcademia from "@/models/MiembroAcademia";
import { calculateCommissionSummary } from "@/utils/commissionCalculator";

/**
 * GET /api/comisiones/profesor
 * Obtiene el resumen de comisiones de todos los grupos de un profesor
 * El profesor solo puede ver sus propias comisiones
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo profesores o dueños de academia pueden acceder
    if (session.user.rol !== "profe" && session.user.rol !== "dueñoAcademia") {
      return NextResponse.json(
        { error: "Solo los profesores pueden acceder a esta información" },
        { status: 403 }
      );
    }

    await connectDB();

    // Obtener todos los grupos del profesor
    const grupos = await Grupo.find({ profesor_id: session.user.id })
      .populate("academia_id")
      .lean();

    // Calcular comisiones para cada grupo
    const gruposConComisiones = await Promise.all(
      grupos.map(async (grupo) => {
        // Contar miembros activos del grupo
        const studentCount = await MiembroAcademia.countDocuments({
          grupo_id: grupo._id,
          estado: "activo",
        });

        // Calcular resumen de comisiones (sin desglose detallado)
        const comisiones = calculateCommissionSummary(studentCount);

        return {
          grupo: {
            _id: String(grupo._id),
            nombre_grupo: grupo.nombre_grupo,
            nivel: grupo.nivel,
            horario: grupo.horario,
            dias: grupo.dias,
          },
          academia: {
            _id: (grupo.academia_id as any)._id.toString(),
            nombre_academia: (grupo.academia_id as any).nombre_academia,
          },
          studentCount,
          comisiones: {
            total_students: comisiones.total_students,
            gross_income: comisiones.gross_income,
            teacher_total: comisiones.teacher_total,
            // No mostrar trivo_total a profesores
          },
        };
      })
    );

    // Calcular totales generales
    const totales = gruposConComisiones.reduce(
      (acc, grupo) => ({
        totalStudents: acc.totalStudents + grupo.comisiones.total_students,
        totalIncome: acc.totalIncome + grupo.comisiones.teacher_total,
        totalGroups: acc.totalGroups + 1,
      }),
      { totalStudents: 0, totalIncome: 0, totalGroups: 0 }
    );

    return NextResponse.json(
      {
        profesor: {
          id: session.user.id,
          nombre: `${session.user.firstname} ${session.user.lastname}`,
        },
        totales,
        grupos: gruposConComisiones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo comisiones del profesor:", error);
    return NextResponse.json(
      { error: "Error al obtener comisiones" },
      { status: 500 }
    );
  }
}
