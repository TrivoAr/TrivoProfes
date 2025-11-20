import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import ClubTrekkingMembership from "@/models/ClubTrekkingMembership";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin puede ver detalles de miembros
    if (session.user.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    const membership = await ClubTrekkingMembership.findById(params.id)
      .populate("userId", "firstname lastname email imagen")
      .lean();

    if (!membership) {
      return NextResponse.json(
        { error: "Membresía no encontrada" },
        { status: 404 }
      );
    }

    const memberDetail = {
      _id: (membership as any)._id.toString(),
      userId: (membership as any).userId._id.toString(),
      firstname: (membership as any).userId.firstname,
      lastname: (membership as any).userId.lastname,
      email: (membership as any).userId.email,
      imagen: (membership as any).userId.imagen,
      fechaInicio: (membership as any).fechaInicio,
      fechaFin: (membership as any).fechaFin,
      proximaFechaPago: (membership as any).proximaFechaPago,
      salidasRealizadas: (membership as any).usoMensual?.salidasRealizadas || 0,
      limiteSemanal: (membership as any).usoMensual?.limiteSemanal || 2,
      penalizacionActiva: (membership as any).penalizacion?.activa || false,
      diasPenalizacion: (membership as any).penalizacion?.diasRestantes || 0,
      inasistenciasConsecutivas:
        (membership as any).penalizacion?.inasistenciasConsecutivas || 0,
      preapprovalId: (membership as any).mercadoPago?.preapprovalId,
      payerEmail: (membership as any).mercadoPago?.payerEmail,
      mpStatus: (membership as any).mercadoPago?.status,
      historialSalidas: (membership as any).historialSalidas || [],
      historialPenalizaciones:
        (membership as any).penalizacion?.historialPenalizaciones || [],
    };

    return NextResponse.json(memberDetail, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo detalle del miembro:", error);
    return NextResponse.json(
      { error: "Error al obtener detalle del miembro" },
      { status: 500 }
    );
  }
}
