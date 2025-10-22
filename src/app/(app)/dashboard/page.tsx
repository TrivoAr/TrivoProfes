import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PartyPopper, Users, School, UserCheck, DollarSign, Edit, Trash2, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Stats, Member } from "@/lib/types";

async function getStats(): Promise<Stats> {
  try {
    // En lugar de fetch, obtenemos los datos directamente desde la base de datos
    const { connectDB } = await import("@/lib/mongodb");
    const SalidaSocial = (await import("@/models/SalidaSocial")).default;
    const TeamSocial = (await import("@/models/TeamSocial")).default;
    const Academia = (await import("@/models/Academia")).default;
    const User = (await import("@/models/User")).default;
    const Pago = (await import("@/models/Pago")).default;

    await connectDB();

    // Obtener todas las estadísticas para el admin
    const [
      totalSalidas,
      totalTeams,
      totalAcademias,
      totalMiembros,
      ingresosAprobados,
    ] = await Promise.all([
      SalidaSocial.countDocuments(),
      TeamSocial.countDocuments(),
      Academia.countDocuments(),
      User.countDocuments(),
      Pago.aggregate([
        { $match: { estado: "aprobado" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return {
      totalSalidas,
      totalTeams,
      totalAcademias,
      totalMiembros,
      ingresosAprobados: ingresosAprobados[0]?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalSalidas: 0,
      totalTeams: 0,
      totalAcademias: 0,
      totalMiembros: 0,
      ingresosAprobados: 0,
    };
  }
}

async function getRevenueData(): Promise<{ month: string; revenue: number }[]> {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Pago = (await import("@/models/Pago")).default;

    await connectDB();

    // Obtener los últimos 7 meses de datos de revenue
    const revenueByMonth = await Pago.aggregate([
      {
        $match: { estado: "aprobado" }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $limit: 7
      }
    ]);

    // Mapear los nombres de los meses en español
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formattedData = revenueByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.total || 0
    }));

    // Si no hay datos, devolver array vacío o datos de ejemplo
    if (formattedData.length === 0) {
      return [
        { month: 'Ene', revenue: 0 },
        { month: 'Feb', revenue: 0 },
        { month: 'Mar', revenue: 0 },
        { month: 'Abr', revenue: 0 },
        { month: 'May', revenue: 0 },
        { month: 'Jun', revenue: 0 },
        { month: 'Jul', revenue: 0 },
      ];
    }

    return formattedData;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
}

// Obtener salidas del profesor
async function getProfesorSalidas(userId: string) {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const SalidaSocial = (await import("@/models/SalidaSocial")).default;

    await connectDB();

    const salidas = await SalidaSocial.find({ creador_id: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return salidas.map(s => ({
      _id: s._id.toString(),
      nombre: s.nombre,
      fecha: s.fecha || "Sin fecha",
      cupo: s.cupo,
      shortId: s.shortId,
    }));
  } catch (error) {
    console.error("Error fetching profesor salidas:", error);
    return [];
  }
}

// Obtener academia del dueño
async function getAcademiaData(userId: string) {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Academia = (await import("@/models/Academia")).default;
    const User = (await import("@/models/User")).default;

    await connectDB();

    const academia = await Academia.findOne({ dueño_id: userId }).lean();

    if (!academia) {
      return null;
    }

    // Obtener miembros de la academia
    const miembros = await User.find({
      academia_id: academia._id
    }).select('firstname lastname email imagen rol').limit(10).lean();

    return {
      academia: {
        _id: academia._id.toString(),
        nombre_academia: academia.nombre_academia,
        tipo_disciplina: academia.tipo_disciplina,
        localidad: academia.localidad,
        provincia: academia.provincia,
      },
      miembros: miembros.map(m => ({
        _id: m._id.toString(),
        firstname: m.firstname,
        lastname: m.lastname,
        email: m.email,
        imagen: m.imagen,
        rol: m.rol,
      })),
      totalMiembros: await User.countDocuments({ academia_id: academia._id }),
    };
  } catch (error) {
    console.error("Error fetching academia data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Verificar que el usuario esté autenticado
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">Debes iniciar sesión para acceder al dashboard.</p>
      </div>
    );
  }

  const userRole = session.user.rol;

  // Dashboard para Profesores
  if (userRole === "profe") {
    const salidas = await getProfesorSalidas(session.user.id);

    return (
      <>
        <PageHeader
          title={`¡Bienvenido, ${session.user.firstname}!`}
          description="Gestiona tus salidas sociales desde aquí."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Mis Salidas" value={String(salidas.length)} icon={PartyPopper} />
        </div>

        <div className="mt-6 grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Salidas Sociales</CardTitle>
                <CardDescription>Accesos rápidos a tus salidas</CardDescription>
              </div>
              <Button asChild>
                <Link href="/outings/new">
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Nueva Salida
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {salidas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes salidas creadas aún.</p>
                  <Button asChild className="mt-4">
                    <Link href="/outings/new">Crear mi primera salida</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cupo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salidas.map((salida) => (
                      <TableRow key={salida._id}>
                        <TableCell className="font-medium">{salida.nombre}</TableCell>
                        <TableCell>{salida.fecha}</TableCell>
                        <TableCell>{salida.cupo} personas</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/outings/${salida.shortId}`}>
                                Ver
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/outings/${salida.shortId}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Enlaces útiles para gestionar tus actividades</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/outings">
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Ver todas mis salidas
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/academies">
                  <School className="mr-2 h-4 w-4" />
                  Ver academias
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Dashboard para Dueños de Academia
  if (userRole === "dueñoAcademia") {
    const [salidas, academiaData] = await Promise.all([
      getProfesorSalidas(session.user.id),
      getAcademiaData(session.user.id)
    ]);

    return (
      <>
        <PageHeader
          title={`¡Bienvenido, ${session.user.firstname}!`}
          description="Gestiona tu academia y salidas sociales."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Mis Salidas" value={String(salidas.length)} icon={PartyPopper} />
          <StatCard
            title="Miembros de Academia"
            value={String(academiaData?.totalMiembros || 0)}
            icon={UserCheck}
          />
          <StatCard
            title="Mi Academia"
            value={academiaData ? "1" : "0"}
            icon={School}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Salidas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Salidas Sociales</CardTitle>
                <CardDescription>Gestiona tus salidas</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/outings/new">
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Nueva
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {salidas.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No tienes salidas creadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salidas.slice(0, 3).map((salida) => (
                    <div key={salida._id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium text-sm">{salida.nombre}</p>
                        <p className="text-xs text-muted-foreground">{salida.fecha}</p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/outings/${salida.shortId}`}>Ver</Link>
                      </Button>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link href="/outings">Ver todas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mi Academia</CardTitle>
                <CardDescription>Información y miembros</CardDescription>
              </div>
              {academiaData && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/academies/${academiaData.academia._id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!academiaData ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No tienes una academia registrada.</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/academies">Crear Academia</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{academiaData.academia.nombre_academia}</h3>
                    <p className="text-sm text-muted-foreground">
                      {academiaData.academia.tipo_disciplina} • {academiaData.academia.localidad}, {academiaData.academia.provincia}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Miembros ({academiaData.totalMiembros})</p>
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/members">
                          <UserPlus className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {academiaData.miembros.slice(0, 5).map((miembro) => (
                        <div key={miembro._id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={miembro.imagen || ""} alt={miembro.firstname} data-ai-hint="person face" />
                            <AvatarFallback>{miembro.firstname[0]}{miembro.lastname[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{miembro.firstname} {miembro.lastname}</p>
                            <p className="text-xs text-muted-foreground">{miembro.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {academiaData.totalMiembros > 5 && (
                      <Button asChild variant="outline" className="w-full mt-3" size="sm">
                        <Link href="/members">Ver todos los miembros</Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/outings">
                <PartyPopper className="mr-2 h-4 w-4" />
                Gestionar Salidas
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/academies">
                <School className="mr-2 h-4 w-4" />
                Gestionar Academia
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  // Dashboard para Admin (mantener el original)
  if (userRole === "admin") {
    const [stats, revenueData] = await Promise.all([
      getStats(),
      getRevenueData()
    ]);

    return (
      <>
        <PageHeader
          title={`¡Bienvenido, ${session?.user?.firstname || "Admin"}!`}
          description="Aquí está el resumen de la actividad de Trivo."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard title="Salidas Sociales" value={String(stats.totalSalidas)} icon={PartyPopper} />
          <StatCard title="Equipos" value={String(stats.totalTeams)} icon={Users} />
          <StatCard title="Academias" value={String(stats.totalAcademias)} icon={School} />
          <StatCard title="Miembros Registrados" value={String(stats.totalMiembros)} icon={UserCheck} />
          <StatCard title="Ingresos Aprobados" value={`$${stats.ingresosAprobados.toLocaleString()}`} icon={DollarSign} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <RevenueChart data={revenueData} />
          <Card className="lg:col-span-2">
              <CardHeader>
                  <CardTitle>Resumen General</CardTitle>
                  <CardDescription>Estadísticas rápidas de toda la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total de Entidades</span>
                      <span className="text-2xl font-bold">
                        {stats.totalSalidas + stats.totalTeams + stats.totalAcademias}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ingresos Totales</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${stats.ingresosAprobados.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Usuarios Activos</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {stats.totalMiembros}
                      </span>
                    </div>
                  </div>
              </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>
                Vista completa del sistema - Solo visible para administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Como administrador, tienes acceso a todas las funcionalidades:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Ver y gestionar todas las salidas sociales</li>
                  <li>Administrar equipos y academias</li>
                  <li>Gestionar todos los usuarios del sistema</li>
                  <li>Aprobar o rechazar pagos</li>
                  <li>Ver estadísticas completas de la plataforma</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Si el rol no es reconocido
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-2xl font-bold">Acceso Restringido</h2>
      <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
    </div>
  );
}
