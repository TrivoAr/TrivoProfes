import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Grupo from "@/models/Grupo";
import Academia from "@/models/Academia";

// GET /api/grupos/[id] - Obtener un grupo específico
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

    const grupo = await Grupo.findById(id)
      .populate("profesor_id", "firstname lastname email imagen")
      .populate("academia_id", "nombre_academia");

    if (!grupo) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(grupo.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para ver este grupo" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(grupo, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo grupo:", error);
    return NextResponse.json(
      { error: "Error al obtener grupo" },
      { status: 500 }
    );
  }
}

// PUT /api/grupos/[id] - Actualizar un grupo
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

    // Obtener el grupo actual
    const grupoActual = await Grupo.findById(id);
    if (!grupoActual) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(grupoActual.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para editar este grupo" },
          { status: 403 }
        );
      }
    }

    // No permitir cambiar el academia_id
    const { academia_id, ...updateData } = body;

    const grupoActualizado = await Grupo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("profesor_id", "firstname lastname email imagen");

    return NextResponse.json(grupoActualizado, { status: 200 });
  } catch (error) {
    console.error("Error actualizando grupo:", error);
    return NextResponse.json(
      { error: "Error al actualizar grupo" },
      { status: 500 }
    );
  }
}

// DELETE /api/grupos/[id] - Eliminar un grupo
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

    // Obtener el grupo
    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(grupo.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para eliminar este grupo" },
          { status: 403 }
        );
      }
    }

    await Grupo.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Grupo eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando grupo:", error);
    return NextResponse.json(
      { error: "Error al eliminar grupo" },
      { status: 500 }
    );
  }
}
