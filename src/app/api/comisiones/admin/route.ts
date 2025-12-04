import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Grupo from "@/models/Grupo";
import MiembroAcademia from "@/models/MiembroAcademia";
import Academia from "@/models/Academia";
import { calculateCommissions } from "@/utils/commissionCalculator";

/**
 * GET /api/comisiones/admin
 * Obtiene el resumen completo de comisiones de todas las academias y grupos
 * Solo accesible por admins
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

    // Solo admins pueden acceder
    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { error: "Solo los administradores pueden acceder a esta información" },
        { status: 403 }
      );
    }

    await connectDB();

    // Obtener todas las academias
    const academias = await Academia.find().populate("dueño_id").lean();

    // Calcular comisiones para cada academia y sus grupos
    const academiasConComisiones = await Promise.all(
      academias.map(async (academia) => {
        // Obtener todos los grupos de la academia
        const grupos = await Grupo.find({ academia_id: academia._id })
          .populate("profesor_id")
          .lean();

        // Calcular comisiones para cada grupo
        const gruposConComisiones = await Promise.all(
          grupos.map(async (grupo) => {
            // Contar miembros activos del grupo
            const studentCount = await MiembroAcademia.countDocuments({
              grupo_id: grupo._id,
              estado: "activo",
            });

            // Calcular comisiones completas
            const comisiones = calculateCommissions(studentCount);

            return {
              grupo: {
                _id: String(grupo._id),
                nombre_grupo: grupo.nombre_grupo,
                nivel: grupo.nivel,
                horario: grupo.horario,
                dias: grupo.dias,
              },
              profesor: grupo.profesor_id
                ? {
                    _id: (grupo.profesor_id as any)._id.toString(),
                    nombre: `${(grupo.profesor_id as any).firstname} ${(grupo.profesor_id as any).lastname}`,
                    email: (grupo.profesor_id as any).email,
                  }
                : null,
              studentCount,
              comisiones: {
                total_students: comisiones.total_students,
                gross_income: comisiones.gross_income,
                teacher_total: comisiones.teacher_total,
                trivo_total: comisiones.trivo_total,
              },
            };
          })
        );

        // Calcular totales por academia
        const totalesAcademia = gruposConComisiones.reduce(
          (acc, grupo) => ({
            totalStudents: acc.totalStudents + grupo.comisiones.total_students,
            grossIncome: acc.grossIncome + grupo.comisiones.gross_income,
            teacherTotal: acc.teacherTotal + grupo.comisiones.teacher_total,
            trivoTotal: acc.trivoTotal + grupo.comisiones.trivo_total,
          }),
          { totalStudents: 0, grossIncome: 0, teacherTotal: 0, trivoTotal: 0 }
        );

        return {
          academia: {
            _id: String(academia._id),
            nombre_academia: academia.nombre_academia,
            tipo_disciplina: academia.tipo_disciplina,
            localidad: academia.localidad,
            provincia: academia.provincia,
          },
          dueño: {
            _id: (academia.dueño_id as any)._id.toString(),
            nombre: `${(academia.dueño_id as any).firstname} ${(academia.dueño_id as any).lastname}`,
            email: (academia.dueño_id as any).email,
          },
          totales: totalesAcademia,
          grupos: gruposConComisiones,
        };
      })
    );

    // Calcular totales generales de la plataforma
    const totalesPlataforma = academiasConComisiones.reduce(
      (acc, academia) => ({
        totalAcademias: acc.totalAcademias + 1,
        totalGrupos: acc.totalGrupos + academia.grupos.length,
        totalStudents: acc.totalStudents + academia.totales.totalStudents,
        grossIncome: acc.grossIncome + academia.totales.grossIncome,
        teacherTotal: acc.teacherTotal + academia.totales.teacherTotal,
        trivoTotal: acc.trivoTotal + academia.totales.trivoTotal,
      }),
      {
        totalAcademias: 0,
        totalGrupos: 0,
        totalStudents: 0,
        grossIncome: 0,
        teacherTotal: 0,
        trivoTotal: 0,
      }
    );

    return NextResponse.json(
      {
        totalesPlataforma,
        academias: academiasConComisiones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo comisiones administrativas:", error);
    return NextResponse.json(
      { error: "Error al obtener comisiones" },
      { status: 500 }
    );
  }
}
