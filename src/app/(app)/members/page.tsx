import { PageHeader } from "@/components/page-header";
import { MembersTable } from "@/components/crud/members-table";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { User as UserType } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getUsers() {
  try {
    await connectDB();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      rol: user.rol,
      telnumber: user.telnumber,
      imagen: user.imagen,
      bio: user.bio,
      instagram: user.instagram,
      facebook: user.facebook,
      twitter: user.twitter,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return JSON.parse(JSON.stringify(serializedUsers)) as UserType[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

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

  const users = await getUsers();

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona todos los usuarios registrados en la plataforma."
      />
      <MembersTable members={users} />
    </>
  );
}
