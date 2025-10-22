import { PageHeader } from "@/components/page-header";
import { OutingsTable } from "@/components/crud/outings-table";
import { connectDB } from "@/lib/mongodb";
import SalidaSocial from "@/models/SalidaSocial";
import MiembroSalida from "@/models/MiembroSalida";
import type { SocialOuting } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getSalidas() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return [];
    }

    await connectDB();

    // Filtrar salidas por el usuario creador
    const salidas = await SalidaSocial.find({ creador_id: session.user.id })
      .populate("creador_id", "firstname lastname email")
      .sort({ createdAt: -1 })
      .lean();

    // Obtener conteo de miembros aprobados para cada salida
    const salidasConMiembros = await Promise.all(
      salidas.map(async (salida: any) => {
        const miembrosAprobados = await MiembroSalida.countDocuments({
          salida_id: salida._id,
          estado: "aprobado",
        });

        return {
          _id: salida._id.toString(),
          nombre: salida.nombre || "",
          ubicacion: salida.ubicacion || undefined,
          deporte: salida.deporte || undefined,
          fecha: salida.fecha || undefined,
          hora: salida.hora || undefined,
          duracion: salida.duracion || undefined,
          descripcion: salida.descripcion || undefined,
          localidad: salida.localidad || undefined,
          provincia: salida.provincia || undefined,
          telefonoOrganizador: salida.telefonoOrganizador || undefined,
          imagen: salida.imagen || undefined,
          locationCoords: salida.locationCoords
            ? {
                lat: salida.locationCoords.lat,
                lng: salida.locationCoords.lng,
              }
            : undefined,
          dificultad: salida.dificultad || undefined,
          precio: salida.precio || undefined,
          cupo: salida.cupo || 0,
          cbu: salida.cbu || undefined,
          alias: salida.alias || undefined,
          whatsappLink: salida.whatsappLink || undefined,
          shortId: salida.shortId || "",
          creador_id: salida.creador_id
            ? {
                _id: salida.creador_id._id?.toString(),
                firstname: salida.creador_id.firstname,
                lastname: salida.creador_id.lastname,
                email: salida.creador_id.email,
              }
            : null,
          participantes: miembrosAprobados,
          createdAt: salida.createdAt,
          updatedAt: salida.updatedAt,
        };
      })
    );

    return JSON.parse(JSON.stringify(salidasConMiembros)) as SocialOuting[];
  } catch (error) {
    console.error("Error fetching salidas:", error);
    return [];
  }
}

export default async function SocialOutingsPage() {
  const salidas = await getSalidas();

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title="Mis Salidas Sociales"
          description="Gestiona tus salidas deportivas y eventos creados."
        />
        <Link href="/outings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Salida
          </Button>
        </Link>
      </div>
      <OutingsTable outings={salidas} />
    </>
  );
}
