import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import ClubTrekkingMembership from "@/models/ClubTrekkingMembership";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin puede ver todos los miembros
    if (session.user.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    // Obtener parámetros de filtro desde la URL
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get("nombre");
    const apellido = searchParams.get("apellido");
    const estado = searchParams.get("estado"); // "activa", "pendiente", "vencida", "cancelada"
    const fechaEspecifica = searchParams.get("fechaEspecifica");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    // Construir query de filtros
    const filter: any = {};

    // Filtro por estado (por defecto solo activas, pero se puede cambiar)
    if (estado) {
      filter.estado = estado;
    } else {
      filter.estado = "activa"; // Por defecto solo activas
    }

    // Filtro por fecha de inicio
    if (fechaEspecifica) {
      // Filtrar por fecha específica (mismo día)
      const fecha = new Date(fechaEspecifica);
      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fecha.getDate() + 1);

      filter.fechaInicio = {
        $gte: fecha,
        $lt: fechaSiguiente
      };
    } else if (fechaDesde || fechaHasta) {
      // Filtrar por rango de fechas
      filter.fechaInicio = {};

      if (fechaDesde) {
        filter.fechaInicio.$gte = new Date(fechaDesde);
      }

      if (fechaHasta) {
        const fechaHastaFin = new Date(fechaHasta);
        fechaHastaFin.setDate(fechaHastaFin.getDate() + 1);
        filter.fechaInicio.$lt = fechaHastaFin;
      }
    }

    // Obtener memberships con filtros
    const memberships = await ClubTrekkingMembership.find(filter)
      .populate("userId", "firstname lastname email imagen")
      .sort({ fechaInicio: -1 })
      .lean();

    // Filtrar por nombre/apellido en memoria (después del populate)
    let filteredMemberships = memberships;

    if (nombre || apellido) {
      filteredMemberships = memberships.filter((m: any) => {
        const user = m.userId;
        if (!user) return false;

        let match = true;

        if (nombre) {
          const nombreLower = nombre.toLowerCase();
          match = match && user.firstname.toLowerCase().includes(nombreLower);
        }

        if (apellido) {
          const apellidoLower = apellido.toLowerCase();
          match = match && user.lastname.toLowerCase().includes(apellidoLower);
        }

        return match;
      });
    }

    const members = filteredMemberships.map((m: any) => ({
      _id: m._id.toString(),
      userId: m.userId._id.toString(),
      firstname: m.userId.firstname,
      lastname: m.userId.lastname,
      email: m.userId.email,
      imagen: m.userId.imagen,
      fechaInicio: m.fechaInicio,
      fechaFin: m.fechaFin,
      proximaFechaPago: m.proximaFechaPago,
      salidasRealizadas: m.usoMensual?.salidasRealizadas || 0,
      limiteSemanal: m.usoMensual?.limiteSemanal || 2,
      penalizacionActiva: m.penalizacion?.activa || false,
      diasPenalizacion: m.penalizacion?.diasRestantes || 0,
      inasistenciasConsecutivas: m.penalizacion?.inasistenciasConsecutivas || 0,
      preapprovalId: m.mercadoPago?.preapprovalId,
      payerEmail: m.mercadoPago?.payerEmail,
      mpStatus: m.mercadoPago?.status,
    }));

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembros del Club:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros del Club" },
      { status: 500 }
    );
  }
}
