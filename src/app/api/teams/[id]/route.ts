import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import TeamSocial from "@/models/TeamSocial";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const team = await TeamSocial.findById(params.id).populate("creadorId", "firstname lastname email");

    if (!team) {
      return NextResponse.json({ error: "Team no encontrado" }, { status: 404 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo team:", error);
    return NextResponse.json({ error: "Error al obtener team" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { creadorId, ...updateData } = body;

    const teamActualizado = await TeamSocial.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true })
      .populate("creadorId", "firstname lastname email");

    if (!teamActualizado) {
      return NextResponse.json({ error: "Team no encontrado" }, { status: 404 });
    }

    return NextResponse.json(teamActualizado, { status: 200 });
  } catch (error) {
    console.error("Error actualizando team:", error);
    return NextResponse.json({ error: "Error al actualizar team" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!["admin", "profe"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const team = await TeamSocial.findByIdAndDelete(params.id);

    if (!team) {
      return NextResponse.json({ error: "Team no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Team eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error eliminando team:", error);
    return NextResponse.json({ error: "Error al eliminar team" }, { status: 500 });
  }
}
