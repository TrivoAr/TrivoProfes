import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";

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
    const academia = await Academia.findById(id).populate("dueño_id", "firstname lastname email");

    if (!academia) {
      return NextResponse.json({ error: "Academia no encontrada" }, { status: 404 });
    }

    return NextResponse.json(academia, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo academia:", error);
    return NextResponse.json({ error: "Error al obtener academia" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { id } = await params;
    const { dueño_id, ...updateData } = body;

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(id);
      if (!academia) {
        return NextResponse.json({ error: "Academia no encontrada" }, { status: 404 });
      }
      if (academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para editar esta academia" },
          { status: 403 }
        );
      }
    }

    const academiaActualizada = await Academia.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("dueño_id", "firstname lastname email");

    if (!academiaActualizada) {
      return NextResponse.json({ error: "Academia no encontrada" }, { status: 404 });
    }

    return NextResponse.json(academiaActualizada, { status: 200 });
  } catch (error) {
    console.error("Error actualizando academia:", error);
    return NextResponse.json({ error: "Error al actualizar academia" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(id);
      if (!academia) {
        return NextResponse.json({ error: "Academia no encontrada" }, { status: 404 });
      }
      if (academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para eliminar esta academia" },
          { status: 403 }
        );
      }
    }

    const academia = await Academia.findByIdAndDelete(id);

    if (!academia) {
      return NextResponse.json({ error: "Academia no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Academia eliminada correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error eliminando academia:", error);
    return NextResponse.json({ error: "Error al eliminar academia" }, { status: 500 });
  }
}
