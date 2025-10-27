import { PageHeader } from "@/components/page-header";
import { MembersTableSimple } from "@/components/crud/members-table-simple";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  // Verificar que el usuario esté autenticado
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  // Verificar que el usuario sea admin
  if (session.user.rol !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Acceso Restringido</h2>
        <p className="text-muted-foreground">Solo los administradores pueden acceder a la gestión de usuarios.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona todos los usuarios registrados en la plataforma. Busca, filtra y navega de forma eficiente."
      />
      <MembersTableSimple />
    </>
  );
}
