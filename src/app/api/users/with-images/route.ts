import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ImageService } from "@/services/ImageService";
import { getProfileImage } from "@/app/api/profile/getProfileImage";

export async function GET(request: Request) {
  console.log("🚀 /api/users/with-images endpoint called");
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.id) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    console.log(`✅ Session found for user: ${session.user.id}`);

    // Verificar que sea admin
    if (session.user.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Obtener parámetros de paginación y búsqueda desde query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";

    await connectDB();

    // Construir filtro de búsqueda
    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (roleFilter) {
      filter.rol = roleFilter;
    }

    // Obtener el total de usuarios para paginación
    const total = await User.countDocuments(filter);

    // Obtener usuarios paginados con filtros
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const usersData = users.map((user: any) => ({
      _id: user._id.toString(),
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      rol: user.rol,
      telnumber: user.telnumber,
      bio: user.bio,
      instagram: user.instagram,
      facebook: user.facebook,
      twitter: user.twitter,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    console.log(`✅ Returning ${usersData.length} users (page ${page}, total: ${total})`);

    return NextResponse.json({
      users: usersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users with images:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
