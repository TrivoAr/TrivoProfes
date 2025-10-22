import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import Pago from "@/models/Pago";

// GET /api/salidas/[id] - Obtener una salida específica
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
    const salida = await SalidaSocial.findById(id)
      .populate("creador_id", "firstname lastname email");

    if (!salida) {
      return NextResponse.json(
        { error: "Salida no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(salida, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo salida:", error);
    return NextResponse.json(
      { error: "Error al obtener salida" },
      { status: 500 }
    );
  }
}

// PUT /api/salidas/[id] - Actualizar una salida
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    // No permitir cambiar el creador_id o shortId
    const { creador_id, shortId, ...updateData } = body;

    const salidaActualizada = await SalidaSocial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("creador_id", "firstname lastname email");

    if (!salidaActualizada) {
      return NextResponse.json(
        { error: "Salida no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(salidaActualizada, { status: 200 });
  } catch (error) {
    console.error("Error actualizando salida:", error);
    return NextResponse.json(
      { error: "Error al actualizar salida" },
      { status: 500 }
    );
  }
}

// PATCH /api/salidas/[id] - Actualizar imagen de una salida
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    // Solo permitir actualizar la imagen
    const { imagen } = body;

    if (!imagen) {
      return NextResponse.json(
        { error: "URL de imagen requerida" },
        { status: 400 }
      );
    }

    const salidaActualizada = await SalidaSocial.findByIdAndUpdate(
      id,
      { imagen },
      { new: true, runValidators: true }
    ).populate("creador_id", "firstname lastname email");

    if (!salidaActualizada) {
      return NextResponse.json(
        { error: "Salida no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(salidaActualizada, { status: 200 });
  } catch (error) {
    console.error("Error actualizando imagen:", error);
    return NextResponse.json(
      { error: "Error al actualizar imagen" },
      { status: 500 }
    );
  }
}

// DELETE /api/salidas/[id] - Eliminar una salida
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const salida = await SalidaSocial.findByIdAndDelete(id);

    if (!salida) {
      return NextResponse.json(
        { error: "Salida no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar miembros asociados
    await MiembroSalida.deleteMany({ salida_id: id });

    // Eliminar pagos asociados
    await Pago.deleteMany({ salidaId: id });

    return NextResponse.json(
      { message: "Salida eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando salida:", error);
    return NextResponse.json(
      { error: "Error al eliminar salida" },
      { status: 500 }
    );
  }
}
