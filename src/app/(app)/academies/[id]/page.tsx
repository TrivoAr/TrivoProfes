import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";
import Grupo from "@/models/Grupo";
import { AcademyDetails } from "@/components/academies/academy-details";

interface AcademyPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getAcademiaDetails(id: string, userId: string) {
  try {
    await connectDB();

    const academia = await Academia.findById(id)
      .populate("dueño_id", "firstname lastname email imagen telnumber")
      .lean();

    if (!academia) {
      return null;
    }

    // Verificar que la academia pertenezca al usuario (excepto admin)
    const session = await getServerSession(authOptions);
    const academiaData = academia as any;
    if (session?.user?.rol !== "admin" && academiaData.dueño_id._id.toString() !== userId) {
      return null;
    }

    // Obtener grupos de la academia
    const grupos = await Grupo.find({ academia_id: id })
      .populate("profesor_id", "firstname lastname email imagen")
      .sort({ createdAt: -1 })
      .lean();

    return {
      academia: JSON.parse(JSON.stringify(academia)),
      grupos: JSON.parse(JSON.stringify(grupos)),
    };
  } catch (error) {
    console.error("Error fetching academia details:", error);
    return null;
  }
}

export default async function AcademyPage({ params }: AcademyPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Sesión no válida</h2>
        <p className="text-muted-foreground">Por favor, inicia sesión nuevamente.</p>
      </div>
    );
  }

  const { id } = await params;
  const data = await getAcademiaDetails(id, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <AcademyDetails
      academia={data.academia}
      grupos={data.grupos}
    />
  );
}
