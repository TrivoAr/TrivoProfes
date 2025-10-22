import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET /api/users - Listar todos los usuarios (solo admin) o buscar por email
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admin y dueños de academia pueden buscar usuarios
    if (!["admin", "dueño de academia"].includes(session.user.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let users;

    if (search) {
      // Buscar por email o nombre
      users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { firstname: { $regex: search, $options: "i" } },
          { lastname: { $regex: search, $options: "i" } },
        ],
      })
        .limit(10)
        .sort({ createdAt: -1 });
    } else {
      // Solo admin puede listar todos
      if (session.user.rol !== "admin") {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      users = await User.find().sort({ createdAt: -1 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear nuevo usuario (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();

    // Validación básica
    if (!body.email || !body.firstname || !body.lastname || !body.password) {
      return NextResponse.json(
        { error: "Campos requeridos: email, firstname, lastname, password" },
        { status: 400 }
      );
    }

    // Validar longitud de password
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await User.create({
      email: body.email,
      password: hashedPassword,
      firstname: body.firstname,
      lastname: body.lastname,
      rol: body.rol || "alumno",
      telnumber: body.telnumber,
      imagen: body.imagen,
      bio: body.bio,
      instagram: body.instagram,
      facebook: body.facebook,
      twitter: body.twitter,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creando usuario:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
