import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ShareButton } from "@/components/outings/share-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PartyPopper, Users, School, UserCheck, DollarSign, Edit, Trash2, UserPlus, CreditCard, Banknote, Mountain } from "lucide-react";
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
import { unstable_cache } from 'next/cache';

// Configurar revalidación de página
export const revalidate = 300; // Revalidar cada 5 minutos

// Cachear las estadísticas
const getCachedStats = unstable_cache(
  async (): Promise<Stats> => {
    try {
      const { connectDB } = await import("@/lib/mongodb");
      const SalidaSocial = (await import("@/models/SalidaSocial")).default;
      const TeamSocial = (await import("@/models/TeamSocial")).default;
      const Academia = (await import("@/models/Academia")).default;
      const User = (await import("@/models/User")).default;
      const Pago = (await import("@/models/Pago")).default;
      const ClubTrekkingMembership = (await import("@/models/ClubTrekkingMembership")).default;

      await connectDB();

      const [
        totalSalidas,
        totalTeams,
        totalAcademias,
        totalMiembros,
        ingresosAprobados,
        ingresosMercadoPago,
        ingresosTransferencia,
        miembrosClubActivos,
        ingresosClubTrekking,
      ] = await Promise.all([
        SalidaSocial.countDocuments(),
        TeamSocial.countDocuments(),
        Academia.countDocuments(),
        User.countDocuments(),
        Pago.aggregate([
          { $match: { estado: "aprobado" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Pago.aggregate([
          { $match: { estado: "aprobado", tipoPago: "mercadopago" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Pago.aggregate([
          { $match: { estado: "aprobado", tipoPago: "transferencia" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        ClubTrekkingMembership.countDocuments({ estado: "activa" }),
        Pago.aggregate([
          { $match: { estado: "aprobado", tipoPago: "mercadopago_automatico" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      return {
        totalSalidas,
        totalTeams,
        totalAcademias,
        totalMiembros,
        ingresosAprobados: ingresosAprobados[0]?.total || 0,
        ingresosMercadoPago: ingresosMercadoPago[0]?.total || 0,
        ingresosTransferencia: ingresosTransferencia[0]?.total || 0,
        miembrosClubActivos,
        ingresosClubTrekking: ingresosClubTrekking[0]?.total || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalSalidas: 0,
        totalTeams: 0,
        totalAcademias: 0,
        totalMiembros: 0,
        ingresosAprobados: 0,
        ingresosMercadoPago: 0,
        ingresosTransferencia: 0,
        miembrosClubActivos: 0,
        ingresosClubTrekking: 0,
      };
    }
  },
  ['dashboard-stats'],
  {
    revalidate: 300, // Cachear por 5 minutos
    tags: ['stats']
  }
);

async function getStats(): Promise<Stats> {
  return getCachedStats();
}

// Cachear datos de revenue
const getCachedRevenueData = unstable_cache(
  async (): Promise<{ month: string; revenue: number }[]> => {
    try {
      const { connectDB } = await import("@/lib/mongodb");
      const Pago = (await import("@/models/Pago")).default;

      await connectDB();

      const revenueByMonth = await Pago.aggregate([
        { $match: { estado: "aprobado" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 7 }
      ]);

      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      const formattedData = revenueByMonth.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: item.total || 0
      }));

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
  },
  ['dashboard-revenue'],
  {
    revalidate: 300,
    tags: ['revenue']
  }
);

async function getRevenueData(): Promise<{ month: string; revenue: number }[]> {
  return getCachedRevenueData();
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

    return salidas.map((s: any) => ({
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
      academia_id: (academia as any)._id
    }).select('firstname lastname email imagen rol').limit(10).lean();

    return {
      academia: {
        _id: ((academia as any)._id).toString(),
        nombre_academia: (academia as any).nombre_academia,
        tipo_disciplina: (academia as any).tipo_disciplina,
        localidad: (academia as any).localidad,
        provincia: (academia as any).provincia,
      },
      miembros: miembros.map((m: any) => ({
        _id: m._id.toString(),
        firstname: m.firstname,
        lastname: m.lastname,
        email: m.email,
        imagen: m.imagen,
        rol: m.rol,
      })),
      totalMiembros: await User.countDocuments({ academia_id: (academia as any)._id }),
    };
  } catch (error) {
    console.error("Error fetching academia data:", error);
    return null;
  }
}

// Obtener miembros activos del Club del Trekking
async function getClubMembers() {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const ClubTrekkingMembership = (await import("@/models/ClubTrekkingMembership")).default;

    await connectDB();

    const memberships = await ClubTrekkingMembership.find({ estado: "activa" })
      .populate("userId", "firstname lastname email imagen")
      .sort({ fechaInicio: -1 })
      .limit(10)
      .lean();

    return memberships.map((m: any) => ({
      _id: m._id.toString(),
      userId: m.userId._id.toString(),
      firstname: m.userId.firstname,
      lastname: m.userId.lastname,
      email: m.userId.email,
      imagen: m.userId.imagen,
      fechaInicio: m.fechaInicio,
      fechaFin: m.fechaFin,
      salidasRealizadas: m.usoMensual?.salidasRealizadas || 0,
      penalizacionActiva: m.penalizacion?.activa || false,
    }));
  } catch (error) {
    console.error("Error fetching club members:", error);
    return [];
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Mis Salidas Sociales</CardTitle>
                <CardDescription>Accesos rápidos a tus salidas</CardDescription>
              </div>
              <Button asChild className="w-full sm:w-auto">
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
                <>
                  {/* Vista Desktop - Tabla */}
                  <div className="hidden sm:block">
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
                                <ShareButton salidaId={salida._id} size="sm" showText={false} />
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/outings/${salida._id}`}>
                                    Ver
                                  </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/outings/${salida._id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vista Móvil - Cards */}
                  <div className="sm:hidden space-y-3">
                    {salidas.map((salida) => (
                      <div key={salida._id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{salida.nombre}</h3>
                            <p className="text-sm text-muted-foreground">{salida.fecha}</p>
                            <p className="text-sm text-muted-foreground">{salida.cupo} personas</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <ShareButton salidaId={salida._id} size="sm" showText={false} />
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/outings/${salida._id}`}>
                              Ver
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/outings/${salida._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
                      <div className="flex gap-1">
                        <ShareButton salidaId={salida._id} size="sm" variant="ghost" showText={false} />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/outings/${salida._id}`}>Ver</Link>
                        </Button>
                      </div>
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
    const [stats, revenueData, clubMembers] = await Promise.all([
      getStats(),
      getRevenueData(),
      getClubMembers()
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
          <StatCard title="Ingresos Totales" value={`$${stats.ingresosAprobados.toLocaleString()}`} icon={DollarSign} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <StatCard title="Ingresos MercadoPago" value={`$${stats.ingresosMercadoPago.toLocaleString()}`} icon={CreditCard} />
          <StatCard title="Ingresos Transferencia" value={`$${stats.ingresosTransferencia.toLocaleString()}`} icon={Banknote} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <StatCard title="Club del Trekking" value={`${stats.miembrosClubActivos} miembros activos`} icon={Mountain} />
          <StatCard title="Revenue Club Trekking" value={`$${stats.ingresosClubTrekking.toLocaleString()}`} icon={Mountain} />
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
                    <div className="flex items-center justify-between border-l-2 border-blue-500 pl-3">
                      <span className="text-xs font-medium text-muted-foreground">MercadoPago</span>
                      <span className="text-lg font-semibold text-blue-600">
                        ${stats.ingresosMercadoPago.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-l-2 border-orange-500 pl-3">
                      <span className="text-xs font-medium text-muted-foreground">Transferencia</span>
                      <span className="text-lg font-semibold text-orange-600">
                        ${stats.ingresosTransferencia.toLocaleString()}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Club del Trekking</CardTitle>
                  <CardDescription>Miembros con suscripción activa</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/club-trekking">
                    <Mountain className="h-4 w-4 mr-2" />
                    Ver todos
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clubMembers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No hay miembros activos en el Club del Trekking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clubMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          userId={member.userId}
                          firstName={member.firstname}
                          lastName={member.lastname}
                          className="h-10 w-10 rounded-full object-cover border shadow-sm"
                          size={80}
                        />
                        <div>
                          <p className="font-medium text-sm">{member.firstname} {member.lastname}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{member.salidasRealizadas} salidas</p>
                        {member.penalizacionActiva && (
                          <span className="text-xs text-red-600">Penalizado</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {stats.miembrosClubActivos > 10 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Mostrando 10 de {stats.miembrosClubActivos} miembros
                    </p>
                  )}
                  <Button asChild variant="outline" className="w-full mt-3" size="sm">
                    <Link href="/club-trekking">Ver todos los miembros</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
