import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import { OutingDetails } from "@/components/outings/outing-details";

interface OutingPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSalidaDetails(id: string) {
  try {
    await connectDB();

    const salida = await SalidaSocial.findById(id)
      .populate("creador_id", "firstname lastname email imagen")
      .populate("sponsor_id", "name imagen")
      .lean();

    if (!salida) {
      return null;
    }

    // Obtener miembros de la salida
    const miembros = await MiembroSalida.find({ salida_id: id })
      .populate("usuario_id", "firstname lastname email imagen")
      .sort({ createdAt: -1 })
      .lean();

    const miembrosAprobados = miembros.filter(
      (m: any) => m.estado === "aprobado"
    ).length;

    return {
      salida: JSON.parse(JSON.stringify(salida)),
      miembros: JSON.parse(JSON.stringify(miembros)),
      participantesCount: miembrosAprobados,
    };
  } catch (error) {
    console.error("Error fetching salida details:", error);
    return null;
  }
}

export default async function OutingPage({ params }: OutingPageProps) {
  const { id } = await params;
  const data = await getSalidaDetails(id);

  if (!data) {
    notFound();
  }

  return <OutingDetails salida={data.salida} miembros={data.miembros} />;
}
