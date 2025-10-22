import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import MiembroSalida from "@/models/MiembroSalida";
import Pago from "@/models/Pago";
import SalidaSocial from "@/models/SalidaSocial";

// PATCH /api/salidas/[id]/miembros/[miembroId] - Aprobar/Rechazar miembro
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; miembroId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { estado } = body; // "aprobado" o "rechazado"

    if (!["aprobado", "rechazado"].includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Si se va a aprobar, verificar que hay cupo disponible
    if (estado === "aprobado") {
      const salida = await SalidaSocial.findById(params.id);
      if (!salida) {
        return NextResponse.json(
          { error: "Salida no encontrada" },
          { status: 404 }
        );
      }

      const miembrosAprobados = await MiembroSalida.countDocuments({
        salida_id: params.id,
        estado: "aprobado",
      });

      if (miembrosAprobados >= salida.cupo) {
        return NextResponse.json(
          { error: "No hay cupos disponibles" },
          { status: 400 }
        );
      }
    }

    const miembro = await MiembroSalida.findById(params.miembroId);

    if (!miembro) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar estado del miembro
    miembro.estado = estado;
    await miembro.save();

    // Si hay pago asociado, también actualizarlo
    if (miembro.pago_id) {
      await Pago.findByIdAndUpdate(miembro.pago_id, { estado });
    }

    await miembro.populate("usuario_id", "firstname lastname email imagen");
    await miembro.populate("pago_id");

    return NextResponse.json(miembro, { status: 200 });
  } catch (error) {
    console.error("Error actualizando miembro:", error);
    return NextResponse.json(
      { error: "Error al actualizar miembro" },
      { status: 500 }
    );
  }
}

// DELETE /api/salidas/[id]/miembros/[miembroId] - Eliminar miembro
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; miembroId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();

    const miembro = await MiembroSalida.findByIdAndDelete(params.miembroId);

    if (!miembro) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar pago asociado si existe
    if (miembro.pago_id) {
      await Pago.findByIdAndDelete(miembro.pago_id);
    }

    return NextResponse.json(
      { message: "Miembro eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando miembro:", error);
    return NextResponse.json(
      { error: "Error al eliminar miembro" },
      { status: 500 }
    );
  }
}
