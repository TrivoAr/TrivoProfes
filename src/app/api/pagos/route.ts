import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Pago from "@/models/Pago";
import SalidaSocial from "@/models/SalidaSocial";
import Notificacion from "@/models/Notificacion";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");

    const filter: any = {};
    if (estado && ["pendiente", "aprobado", "rechazado"].includes(estado)) {
      filter.estado = estado;
    }

    const pagos = await Pago.find(filter)
      .populate("userId", "firstname lastname email imagen")
      .populate("salidaId", "nombre")
      .populate("academiaId", "nombre_academia")
      .sort({ createdAt: -1 });

    return NextResponse.json(pagos, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 });
  }
}

// POST /api/pagos - Crear un nuevo pago (cuando usuario sube comprobante)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { salidaId, academiaId, comprobanteUrl, tipoPago, amount } = body;

    // Validar que tenga al menos salidaId o academiaId
    if (!salidaId && !academiaId) {
      return NextResponse.json(
        { error: "Debe especificar salidaId o academiaId" },
        { status: 400 }
      );
    }

    // Determinar el monto del pago
    let pagoAmount = amount;
    let salida = null;

    // Si es una salida, obtenerla una vez para precio y notificación
    if (salidaId) {
      salida = await SalidaSocial.findById(salidaId).populate(
        "creador_id",
        "firstname lastname"
      );

      // Si no viene amount, extraer el precio de la salida
      if (!pagoAmount && salida && salida.precio) {
        // Extraer el número del precio (ej: "$5000" -> 5000)
        const precioMatch = salida.precio.match(/\d+/);
        if (precioMatch) {
          pagoAmount = parseInt(precioMatch[0], 10);
        }
      }
    }

    // Si no viene amount y es una academia, podrías obtener el precio de la academia
    // (implementar lógica similar si las academias tienen precio)

    // Crear el pago
    const pago = await Pago.create({
      userId: session.user.id,
      salidaId,
      academiaId,
      comprobanteUrl,
      tipoPago: tipoPago || "transferencia",
      amount: pagoAmount || 0,
      estado: "pendiente",
      // Guardar nombre de la salida para tracking (persiste aunque se borre la salida)
      salidaNombre: salida?.nombre,
      // Si es academia, guardar el nombre también (implementar si necesario)
    });

    // Si es una salida, crear notificación para el organizador
    if (salidaId && salida) {
      await Notificacion.create({
        userId: salida.creador_id._id,
        type: "payment_pending",
        message: `${session.user.firstname} ${session.user.lastname} ha enviado el comprobante de pago`,
        relatedId: salidaId,
        relatedUserId: session.user.id,
        metadata: {
          salidaNombre: salida.nombre,
          userName: `${session.user.firstname} ${session.user.lastname}`,
          shortId: salida.shortId, // Agregar shortId para navegación
        },
        read: false,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pago registrado exitosamente",
        pago: JSON.parse(JSON.stringify(pago)),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando pago:", error);
    return NextResponse.json(
      { error: "Error al crear pago", details: error.message },
      { status: 500 }
    );
  }
}
