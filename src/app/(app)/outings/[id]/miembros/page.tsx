import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import Pago from "@/models/Pago";
import { MembersManagement } from "@/components/outings/members-management";

interface MembersPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSalidaWithMembers(id: string) {
  try {
    await connectDB();

    const salida = await SalidaSocial.findById(id)
      .populate("creador_id", "firstname lastname email")
      .lean();

    if (!salida) {
      return null;
    }

    // Obtener todos los miembros con sus pagos
    const miembros = await MiembroSalida.find({ salida_id: id })
      .populate("usuario_id", "firstname lastname email imagen")
      .populate("pago_id")
      .sort({ createdAt: -1 })
      .lean();

    return {
      salida: JSON.parse(JSON.stringify(salida)),
      miembros: JSON.parse(JSON.stringify(miembros)),
    };
  } catch (error) {
    console.error("Error fetching salida with members:", error);
    return null;
  }
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params;
  const data = await getSalidaWithMembers(id);

  if (!data) {
    notFound();
  }

  return <MembersManagement salida={data.salida} miembros={data.miembros} />;
}
