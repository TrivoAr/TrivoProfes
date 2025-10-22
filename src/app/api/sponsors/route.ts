import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sponsors from "@/models/Sponsors";

/**
 * GET /api/sponsors
 * Get all sponsors
 */
export async function GET() {
  try {
    await connectDB();

    const sponsors = await Sponsors.find({}).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      sponsors,
    });
  } catch (error: any) {
    console.error("[GET /api/sponsors] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener los sponsors",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sponsors
 * Create a new sponsor
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, imagen } = body;

    // Validaciones
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre del sponsor debe tener al menos 3 caracteres",
        },
        { status: 400 }
      );
    }

    const newSponsor = await Sponsors.create({
      name: name.trim(),
      imagen,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sponsor creado exitosamente",
        sponsor: newSponsor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/sponsors] Error:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Ya existe un sponsor con ese nombre",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al crear el sponsor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
