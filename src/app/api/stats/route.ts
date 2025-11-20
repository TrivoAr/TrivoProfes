import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import TeamSocial from "@/models/TeamSocial";
import Academia from "@/models/Academia";
import User from "@/models/User";
import Pago from "@/models/Pago";
import ClubTrekkingMembership from "@/models/ClubTrekkingMembership";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalSalidas,
      totalTeams,
      totalAcademias,
      totalMiembros,
      pagosPendientes,
      ingresosAprobados,
      ingresosMercadoPago,
      ingresosTransferencia,
      miembrosClubActivos,
      ingresosClubTrekking,
    ] = await Promise.all([
      SalidaSocial.countDocuments(),
      TeamSocial.countDocuments(),
      Academia.countDocuments(),
      User.countDocuments(),
      Pago.countDocuments({ estado: "pendiente" }),
      Pago.aggregate([
        { $match: { estado: "aprobado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Pago.aggregate([
        { $match: { estado: "aprobado", tipoPago: "mercadopago" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Pago.aggregate([
        { $match: { estado: "aprobado", tipoPago: "transferencia" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      ClubTrekkingMembership.countDocuments({ estado: "activa" }),
      Pago.aggregate([
        { $match: { estado: "aprobado", tipoPago: "mercadopago_automatico" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return NextResponse.json({
      totalSalidas,
      totalTeams,
      totalAcademias,
      totalMiembros,
      pagosPendientes,
      ingresosAprobados: ingresosAprobados[0]?.total || 0,
      ingresosMercadoPago: ingresosMercadoPago[0]?.total || 0,
      ingresosTransferencia: ingresosTransferencia[0]?.total || 0,
      miembrosClubActivos,
      ingresosClubTrekking: ingresosClubTrekking[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
