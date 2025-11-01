import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MiembroSalida from "@/models/MiembroSalida";
import { ImageService } from "@/services/ImageService";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    // Obtener todos los miembros con sus datos poblados
    const miembros = await MiembroSalida.find({ salida_id: id })
      .populate("usuario_id", "firstname lastname email imagen")
      .populate("pago_id")
      .sort({ createdAt: -1 })
      .lean();

    // Procesar miembros y generar URLs de fallback
    const miembrosProcessed = miembros.map((miembro: any) => {
      const usuario = miembro.usuario_id;

      // Caso 1: Usuario eliminado
      if (!usuario) {
        return {
          ...miembro,
          usuario_id: {
            _id: null,
            firstname: "Usuario eliminado",
            lastname: "",
            email: "",
            imagen: ImageService.generateAvatarUrl("U"),
          },
        };
      }

      // Caso 2: Usuario existe - usar imagen de BD o generar fallback
      // La imagen será manejada por el cliente si viene de Firebase
      const imagenFallback = ImageService.generateAvatarUrl(
        usuario.firstname || "U"
      );

      return {
        ...miembro,
        usuario_id: {
          ...usuario,
          // Si el usuario tiene imagen en BD, usarla; sino usar fallback
          imagen: usuario.imagen || imagenFallback,
          // Agregar campos adicionales para que el cliente pueda obtener imagen de Firebase
          _id: usuario._id,
          hasFirebaseImage: !usuario.imagen, // Indica si debe intentar cargar de Firebase
        },
      };
    });

    return NextResponse.json(miembrosProcessed, { status: 200 });
  } catch (error) {
    console.error("Error fetching members with images:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}
