import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import ConfiguracionWhatsApp from "@/models/ConfiguracionWhatsApp";
import User from "@/models/User";

// GET: Obtener configuración de WhatsApp
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la configuración (solo debería haber una)
    let config = await ConfiguracionWhatsApp.findOne().lean();

    // Si no existe, crear una configuración por defecto
    if (!config) {
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      const newConfig = await ConfiguracionWhatsApp.create({
        gruposPorDeporte: {
          Running: "",
          Trekking: "",
          Ciclismo: "",
          Otros: "",
        },
        createdBy: user._id,
      });

      config = JSON.parse(JSON.stringify(newConfig));
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/configuracion-whatsapp:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar configuración de WhatsApp (solo admin)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.rol !== "admin") {
      return NextResponse.json(
        { error: "Solo los administradores pueden modificar esta configuración" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gruposPorDeporte } = body;

    // Buscar la configuración existente o crear una nueva
    let config = await ConfiguracionWhatsApp.findOne();

    if (config) {
      // Actualizar configuración existente
      config.gruposPorDeporte = gruposPorDeporte;
      await config.save();
    } else {
      // Crear nueva configuración
      config = await ConfiguracionWhatsApp.create({
        gruposPorDeporte,
        createdBy: user._id,
      });
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/configuracion-whatsapp:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
