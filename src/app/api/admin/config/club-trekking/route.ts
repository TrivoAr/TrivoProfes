import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import ClubTrekkingConfig from "@/models/ClubTrekkingConfig";

// GET - Obtener configuración actual
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y rol de admin
    if (!session?.user?.id || session.user.rol !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden acceder." },
        { status: 403 }
      );
    }

    await connectDB();

    // Buscar configuración existente
    let config = await ClubTrekkingConfig.findOne();

    // Si no existe configuración, crear una con valores por defecto
    if (!config) {
      config = await ClubTrekkingConfig.create({
        precioMensual: Number(process.env.CLUB_PRECIO_MENSUAL) || 25000,
        maxPrecioSalida: Number(process.env.CLUB_MAX_PRECIO_SALIDA) || 10000,
        limiteSemanal: Number(process.env.CLUB_LIMITE_SEMANAL) || 2,
        radioCheckIn: Number(process.env.CLUB_RADIO_CHECKIN) || 100,
        deportePermitido: process.env.CLUB_DEPORTE_PERMITIDO || "Trekking",
        active: process.env.CLUB_ACTIVE === "true" || true,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({
      precioMensual: config.precioMensual,
      maxPrecioSalida: config.maxPrecioSalida,
      limiteSemanal: config.limiteSemanal,
      radioCheckIn: config.radioCheckIn,
      deportePermitido: config.deportePermitido,
      active: config.active,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
    });
  } catch (error) {
    console.error("Error obteniendo configuración del Club:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y rol de admin
    if (!session?.user?.id || session.user.rol !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden modificar la configuración." },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      precioMensual,
      maxPrecioSalida,
      limiteSemanal,
      radioCheckIn,
      deportePermitido,
      active,
    } = body;

    // Validaciones
    const errors: string[] = [];

    if (precioMensual !== undefined) {
      if (typeof precioMensual !== "number" || precioMensual < 0) {
        errors.push("precioMensual debe ser un número positivo");
      }
    }

    if (maxPrecioSalida !== undefined) {
      if (typeof maxPrecioSalida !== "number" || maxPrecioSalida < 0) {
        errors.push("maxPrecioSalida debe ser un número positivo");
      }
    }

    if (limiteSemanal !== undefined) {
      if (
        typeof limiteSemanal !== "number" ||
        limiteSemanal < 1 ||
        limiteSemanal > 7
      ) {
        errors.push("limiteSemanal debe ser un número entre 1 y 7");
      }
    }

    if (radioCheckIn !== undefined) {
      if (
        typeof radioCheckIn !== "number" ||
        radioCheckIn < 10 ||
        radioCheckIn > 1000
      ) {
        errors.push("radioCheckIn debe ser un número entre 10 y 1000 metros");
      }
    }

    if (deportePermitido !== undefined) {
      if (typeof deportePermitido !== "string" || deportePermitido.trim() === "") {
        errors.push("deportePermitido debe ser un texto válido");
      }
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        errors.push("active debe ser un valor booleano");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Errores de validación", details: errors },
        { status: 400 }
      );
    }

    // Buscar configuración existente o crear una nueva
    let config = await ClubTrekkingConfig.findOne();

    const updateData: any = {
      updatedBy: session.user.id,
    };

    if (precioMensual !== undefined) updateData.precioMensual = precioMensual;
    if (maxPrecioSalida !== undefined) updateData.maxPrecioSalida = maxPrecioSalida;
    if (limiteSemanal !== undefined) updateData.limiteSemanal = limiteSemanal;
    if (radioCheckIn !== undefined) updateData.radioCheckIn = radioCheckIn;
    if (deportePermitido !== undefined) updateData.deportePermitido = deportePermitido;
    if (active !== undefined) updateData.active = active;

    if (!config) {
      // Crear nueva configuración con valores por defecto y actualizar con los proporcionados
      config = await ClubTrekkingConfig.create({
        precioMensual: precioMensual ?? 25000,
        maxPrecioSalida: maxPrecioSalida ?? 10000,
        limiteSemanal: limiteSemanal ?? 2,
        radioCheckIn: radioCheckIn ?? 100,
        deportePermitido: deportePermitido ?? "Trekking",
        active: active ?? true,
        updatedBy: session.user.id,
      });
    } else {
      // Actualizar configuración existente
      config = await ClubTrekkingConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json({
      message: "Configuración actualizada correctamente",
      config: {
        precioMensual: config.precioMensual,
        maxPrecioSalida: config.maxPrecioSalida,
        limiteSemanal: config.limiteSemanal,
        radioCheckIn: config.radioCheckIn,
        deportePermitido: config.deportePermitido,
        active: config.active,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
      },
    });
  } catch (error) {
    console.error("Error actualizando configuración del Club:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
