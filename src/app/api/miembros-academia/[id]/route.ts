import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import MiembroAcademia from "@/models/MiembroAcademia";
import Academia from "@/models/Academia";

// GET /api/miembros-academia/[id] - Obtener un miembro específico
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

    const miembro = await MiembroAcademia.findById(id)
      .populate("usuario_id", "firstname lastname email imagen telnumber")
      .populate("grupo_id", "nombre_grupo")
      .populate("academia_id", "nombre_academia");

    if (!miembro) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(miembro.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para ver este miembro" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(miembro, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembro:", error);
    return NextResponse.json(
      { error: "Error al obtener miembro" },
      { status: 500 }
    );
  }
}

// PUT /api/miembros-academia/[id] - Actualizar un miembro
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

    // Obtener el miembro actual
    const miembroActual = await MiembroAcademia.findById(id);
    if (!miembroActual) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(miembroActual.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para editar este miembro" },
          { status: 403 }
        );
      }
    }

    // No permitir cambiar el academia_id ni usuario_id
    const { academia_id, usuario_id, ...updateData } = body;

    const miembroActualizado = await MiembroAcademia.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("usuario_id", "firstname lastname email imagen telnumber")
      .populate("grupo_id", "nombre_grupo");

    return NextResponse.json(miembroActualizado, { status: 200 });
  } catch (error) {
    console.error("Error actualizando miembro:", error);
    return NextResponse.json(
      { error: "Error al actualizar miembro" },
      { status: 500 }
    );
  }
}

// DELETE /api/miembros-academia/[id] - Eliminar un miembro
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

    // Obtener el miembro
    const miembro = await MiembroAcademia.findById(id);
    if (!miembro) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    if (session.user.rol !== "admin") {
      const academia = await Academia.findById(miembro.academia_id);
      if (!academia || academia.dueño_id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "No tienes permisos para eliminar este miembro" },
          { status: 403 }
        );
      }
    }

    await MiembroAcademia.findByIdAndDelete(id);

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
