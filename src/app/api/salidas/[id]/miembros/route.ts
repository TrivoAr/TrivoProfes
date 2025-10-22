import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import MiembroSalida from "@/models/MiembroSalida";
import Pago from "@/models/Pago";

// GET /api/salidas/[id]/miembros - Listar miembros de una salida
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    const miembros = await MiembroSalida.find({ salida_id: params.id })
      .populate("usuario_id", "firstname lastname email imagen")
      .populate("pago_id")
      .sort({ createdAt: -1 });

    return NextResponse.json(miembros, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembros:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}
