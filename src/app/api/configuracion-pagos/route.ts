import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import ConfiguracionPagos from "@/models/ConfiguracionPagos";

// GET /api/configuracion-pagos - Obtener configuración de pagos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await connectDB();

    // Obtener la configuración más reciente (debería haber solo una)
    const configuracion = await ConfiguracionPagos.findOne().sort({ createdAt: -1 });

    if (!configuracion) {
      // Si no hay configuración, devolver valores por defecto
      return NextResponse.json({
        precioPorDefecto: "",
        cbuPorDefecto: "",
        aliasPorDefecto: "",
        preciosPorDeporte: {
          Running: "",
          Trekking: "",
          Ciclismo: "",
          Otros: "",
        },
        permitirPagosGratis: true,
      });
    }

    return NextResponse.json(configuracion, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo configuración de pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// POST /api/configuracion-pagos - Crear o actualizar configuración
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden modificar la configuración
    if (session.user.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    // Buscar si ya existe una configuración
    const configuracionExistente = await ConfiguracionPagos.findOne();

    if (configuracionExistente) {
      // Actualizar la configuración existente
      configuracionExistente.precioPorDefecto = body.precioPorDefecto;
      configuracionExistente.cbuPorDefecto = body.cbuPorDefecto;
      configuracionExistente.aliasPorDefecto = body.aliasPorDefecto;
      configuracionExistente.preciosPorDeporte = body.preciosPorDeporte;
      configuracionExistente.permitirPagosGratis = body.permitirPagosGratis ?? true;

      await configuracionExistente.save();

      return NextResponse.json(
        {
          success: true,
          message: "Configuración actualizada exitosamente",
          configuracion: configuracionExistente,
        },
        { status: 200 }
      );
    } else {
      // Crear nueva configuración
      const nuevaConfiguracion = await ConfiguracionPagos.create({
        precioPorDefecto: body.precioPorDefecto,
        cbuPorDefecto: body.cbuPorDefecto,
        aliasPorDefecto: body.aliasPorDefecto,
        preciosPorDeporte: body.preciosPorDeporte,
        permitirPagosGratis: body.permitirPagosGratis ?? true,
        createdBy: session.user.id,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Configuración creada exitosamente",
          configuracion: nuevaConfiguracion,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error guardando configuración de pagos:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración", details: error.message },
      { status: 500 }
    );
  }
}
