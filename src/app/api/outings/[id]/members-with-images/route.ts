import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MiembroSalida from "@/models/MiembroSalida";
import { ImageService } from "@/services/ImageService";
import { getProfileImage } from "@/app/api/profile/getProfileImage";

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
      .populate("usuario_id", "firstname lastname email")
      .populate("pago_id")
      .sort({ createdAt: -1 })
      .lean();

    // Timeout: 1.5s en producción, 3s en desarrollo
    const timeoutDuration =
      process.env.NODE_ENV === "production" ? 1500 : 3000;

    // Procesar imágenes de perfil desde Firebase con Promise.allSettled
    const miembrosResults = await Promise.allSettled(
      miembros.map(async (miembro: any) => {
        try {
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

          // Caso 2: Obtener imagen desde Firebase con timeout
          let imagenUrl;
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Image fetch timeout")),
                timeoutDuration
              )
            );

            // Race entre fetch de imagen y timeout
            imagenUrl = await Promise.race([
              getProfileImage("profile-image.jpg", usuario._id.toString()),
              timeoutPromise,
            ]);
          } catch (imageError) {
            // Fallback a ui-avatars.com
            imagenUrl = ImageService.generateAvatarUrl(
              usuario.firstname || "U"
            );
          }

          return {
            ...miembro,
            usuario_id: {
              ...usuario,
              imagen: imagenUrl,
            },
          };
        } catch (e) {
          // Error interno - avatar rojo
          return {
            ...miembro,
            usuario_id: {
              _id: miembro.usuario_id?._id || null,
              firstname: "Error interno",
              lastname: "",
              email: "",
              imagen:
                "https://ui-avatars.com/api/?name=E&background=ff0000&color=fff&size=128",
            },
          };
        }
      })
    );

    // Extraer solo los resultados exitosos
    const miembrosConImagenes = miembrosResults
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => result.value);

    return NextResponse.json(miembrosConImagenes, { status: 200 });
  } catch (error) {
    console.error("Error fetching members with images:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}
