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

    if (!id) {
      return NextResponse.json(
        { error: "ID de salida no proporcionado" },
        { status: 400 }
      );
    }

    await connectDB();

    // Obtener todos los miembros con sus datos poblados
    const miembros = await MiembroSalida.find({ salida_id: id })
      .populate("usuario_id", "firstname lastname email imagen")
      .populate("pago_id")
      .sort({ createdAt: -1 })
      .lean();

    // Procesar miembros y generar URLs de fallback
    const miembrosProcessed = miembros.map((miembro: any) => {
      try {
        const usuario = miembro.usuario_id;

        // Caso 1: Usuario eliminado
        if (!usuario || !usuario._id) {
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
        const imagenFallback = ImageService.generateAvatarUrl(
          usuario.firstname || "U"
        );

        return {
          ...miembro,
          usuario_id: {
            _id: usuario._id.toString(),
            firstname: usuario.firstname || "",
            lastname: usuario.lastname || "",
            email: usuario.email || "",
            imagen: usuario.imagen || imagenFallback,
            hasFirebaseImage: !usuario.imagen,
          },
        };
      } catch (processingError) {
        console.error("Error processing member:", miembro._id, processingError);
        // Return a safe default if processing fails
        return {
          ...miembro,
          usuario_id: {
            _id: null,
            firstname: "Error",
            lastname: "",
            email: "",
            imagen: ImageService.generateAvatarUrl("?"),
          },
        };
      }
    });

    return NextResponse.json(miembrosProcessed, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      }
    });
  } catch (error) {
    console.error("Error fetching members with images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Error al obtener miembros",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
