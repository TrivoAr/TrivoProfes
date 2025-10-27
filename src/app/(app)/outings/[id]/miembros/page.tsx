import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import { MembersManagementClient } from "@/components/outings/members-management-client";

interface MembersPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSalida(id: string) {
  try {
    await connectDB();

    const salida = await SalidaSocial.findById(id)
      .populate("creador_id", "firstname lastname email")
      .lean();

    if (!salida) {
      return null;
    }

    return JSON.parse(JSON.stringify(salida));
  } catch (error) {
    console.error("Error fetching salida:", error);
    return null;
  }
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params;
  const salida = await getSalida(id);

  if (!salida) {
    notFound();
  }

  return <MembersManagementClient salidaId={id} salida={salida} />;
}
