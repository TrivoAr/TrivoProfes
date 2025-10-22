import { PageHeader } from "@/components/page-header";
import { TeamsTable } from "@/components/crud/teams-table";
import { connectDB } from "@/lib/mongodb";
import TeamSocial from "@/models/TeamSocial";
import type { Team } from "@/lib/types";

async function getTeams() {
  try {
    await connectDB();

    const teams = await TeamSocial.find()
      .populate("creadorId", "firstname lastname email")
      .sort({ createdAt: -1 })
      .lean();

    const serializedTeams = teams.map((team: any) => ({
      _id: team._id.toString(),
      nombre: team.nombre || "",
      ubicacion: team.ubicacion || "",
      precio: team.precio || "",
      deporte: team.deporte || "",
      fecha: team.fecha || "",
      hora: team.hora || "",
      duracion: team.duracion || "",
      localidad: team.localidad || undefined,
      provincia: team.provincia || undefined,
      telefonoOrganizador: team.telefonoOrganizador || undefined,
      whatsappLink: team.whatsappLink || undefined,
      descripcion: team.descripcion || undefined,
      imagen: team.imagen || undefined,
      locationCoords: team.locationCoords
        ? {
            lat: team.locationCoords.lat,
            lng: team.locationCoords.lng,
          }
        : undefined,
      creadorId: team.creadorId
        ? {
            _id: team.creadorId._id?.toString(),
            firstname: team.creadorId.firstname,
            lastname: team.creadorId.lastname,
            email: team.creadorId.email,
          }
        : null,
      cupo: team.cupo || 0,
      cbu: team.cbu || undefined,
      alias: team.alias || undefined,
      dificultad: team.dificultad || undefined,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));

    return JSON.parse(JSON.stringify(serializedTeams)) as Team[];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <>
      <PageHeader
        title="Equipos Deportivos"
        description="Gestiona los equipos deportivos y sus horarios."
      />
      <TeamsTable teams={teams} />
    </>
  );
}
