import { PageHeader } from "@/components/page-header";
import { AcademiesTable } from "@/components/crud/academies-table";
import { connectDB } from "@/lib/mongodb";
import Academia from "@/models/Academia";
import type { Academy } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getAcademias(userId: string) {
  try {
    await connectDB();

    // Mostrar solo las academias del usuario actual
    const academias = await Academia.find({ dueño_id: userId })
      .populate("dueño_id", "firstname lastname email")
      .sort({ createdAt: -1 })
      .lean();

    const serializedAcademias = academias.map((academia: any) => ({
      _id: academia._id.toString(),
      nombre_academia: academia.nombre_academia || "",
      pais: academia.pais || "",
      provincia: academia.provincia || "",
      localidad: academia.localidad || "",
      descripcion: academia.descripcion || undefined,
      tipo_disciplina: academia.tipo_disciplina || "Otros",
      telefono: academia.telefono || undefined,
      imagen: academia.imagen || undefined,
      clase_gratis: academia.clase_gratis || false,
      precio: academia.precio || undefined,
      cbu: academia.cbu || undefined,
      alias: academia.alias || undefined,
      dueño_id: academia.dueño_id
        ? {
            _id: academia.dueño_id._id?.toString(),
            firstname: academia.dueño_id.firstname,
            lastname: academia.dueño_id.lastname,
            email: academia.dueño_id.email,
          }
        : null,
      createdAt: academia.createdAt,
      updatedAt: academia.updatedAt,
    }));

    return JSON.parse(JSON.stringify(serializedAcademias)) as Academy[];
  } catch (error) {
    console.error("Error fetching academias:", error);
    return [];
  }
}

export default async function AcademiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Sesión no válida</h2>
        <p className="text-muted-foreground">Por favor, inicia sesión nuevamente.</p>
      </div>
    );
  }

  const academias = await getAcademias(session.user.id);

  return (
    <>
      <PageHeader
        title="Mi Academia Deportiva"
        description="Gestiona tu academia y sus membresías."
      />
      <AcademiesTable academies={academias} />
    </>
  );
}
