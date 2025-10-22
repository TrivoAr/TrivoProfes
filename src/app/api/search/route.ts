import { NextRequest, NextResponse } from "next/server";

// GET /api/search?q=query - Buscar direcciones usando Nominatim (OpenStreetMap)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Usar Nominatim (OpenStreetMap) para geocodificación
    // Es gratis y no requiere API key
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5&countrycodes=ar`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "TrivoApp/1.0", // Nominatim requiere un User-Agent
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching from Nominatim");
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Error al buscar direcciones" },
      { status: 500 }
    );
  }
}
