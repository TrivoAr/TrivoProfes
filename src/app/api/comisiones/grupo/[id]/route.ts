import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Grupo from "@/models/Grupo";
import MiembroAcademia from "@/models/MiembroAcademia";
import Academia from "@/models/Academia";
import { calculateCommissions } from "@/utils/commissionCalculator";

/**
 * GET /api/comisiones/grupo/[id]
 * Obtiene el cálculo de comisiones para un grupo específico
 * Solo accesible por el profesor del grupo o admins
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const grupoId = params.id;

    await connectDB();

    // Obtener el grupo
    const grupo = await Grupo.findById(grupoId).populate("academia_id");

    if (!grupo) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos: debe ser el profesor del grupo, el dueño de la academia, o admin
    const isProfesor = grupo.profesor_id?.toString() === session.user.id;
    const isDueñoAcademia = (grupo.academia_id as any).dueño_id?.toString() === session.user.id;
    const isAdmin = session.user.rol === "admin";

    if (!isProfesor && !isDueñoAcademia && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para ver las comisiones de este grupo" },
        { status: 403 }
      );
    }

    // Contar miembros activos del grupo
    const studentCount = await MiembroAcademia.countDocuments({
      grupo_id: grupoId,
      estado: "activo",
    });

    // Calcular comisiones
    const commissionData = calculateCommissions(studentCount);

    // Información adicional del grupo
    const response = {
      grupo: {
        _id: grupo._id.toString(),
        nombre_grupo: grupo.nombre_grupo,
        nivel: grupo.nivel,
        horario: grupo.horario,
        dias: grupo.dias,
      },
      academia: {
        _id: (grupo.academia_id as any)._id.toString(),
        nombre_academia: (grupo.academia_id as any).nombre_academia,
      },
      comisiones: commissionData,
      // Solo mostrar el desglose completo a admins
      showFullBreakdown: isAdmin,
    };

    // Si no es admin, limitar el breakdown a mostrar solo información resumida
    if (!isAdmin) {
      // Para profesores, solo mostrar su parte
      if (isProfesor) {
        response.comisiones = {
          ...commissionData,
          // Ocultar el detalle de Trivo
          trivo_total: undefined,
          breakdown: commissionData.breakdown.map((item) => ({
            student_position: item.student_position,
            teacher_cut: item.teacher_cut,
            applied_rate: item.applied_rate,
            trivo_cut: undefined, // Ocultar la parte de Trivo
          })),
        } as any;
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error calculando comisiones:", error);
    return NextResponse.json(
      { error: "Error al calcular comisiones" },
      { status: 500 }
    );
  }
}
