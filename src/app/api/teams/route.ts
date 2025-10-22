import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import TeamSocial from "@/models/TeamSocial";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();
    const teams = await TeamSocial.find()
      .populate("creadorId", "firstname lastname email")
      .sort({ createdAt: -1 });

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo teams:", error);
    return NextResponse.json({ error: "Error al obtener teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    if (!body.nombre || !body.ubicacion || !body.precio || !body.deporte || !body.fecha || !body.hora || !body.duracion || !body.cupo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const nuevoTeam = await TeamSocial.create({
      ...body,
      creadorId: session.user.id,
    });

    await nuevoTeam.populate("creadorId", "firstname lastname email");
    return NextResponse.json(nuevoTeam, { status: 201 });
  } catch (error: any) {
    console.error("Error creando team:", error);
    return NextResponse.json({ error: "Error al crear team" }, { status: 500 });
  }
}
