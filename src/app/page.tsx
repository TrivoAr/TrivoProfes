import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Si no hay sesión, redirigir a login
  if (!session) {
    redirect('/login');
  }

  // Si hay sesión, redirigir al dashboard
  redirect('/dashboard');
}
