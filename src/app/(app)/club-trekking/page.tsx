"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mountain, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MembersFiltersComponent, MembersFilters } from "@/components/club-trekking/members-filters";

interface ClubMember {
  _id: string;
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  imagen?: string;
  fechaInicio: Date;
  fechaFin: Date;
  proximaFechaPago: Date;
  salidasRealizadas: number;
  limiteSemanal: number;
  penalizacionActiva: boolean;
  diasPenalizacion: number;
  inasistenciasConsecutivas: number;
  preapprovalId?: string;
  payerEmail?: string;
  mpStatus?: string;
}

export default function ClubTrekkingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MembersFilters>({
    nombre: "",
    apellido: "",
    estado: "activa",
    tipoFecha: "ninguna",
    fechaEspecifica: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  // Construir URL con parámetros de filtro
  const buildFilterUrl = (currentFilters: MembersFilters) => {
    const params = new URLSearchParams();

    if (currentFilters.nombre) params.append("nombre", currentFilters.nombre);
    if (currentFilters.apellido) params.append("apellido", currentFilters.apellido);
    if (currentFilters.estado && currentFilters.estado !== "todas") {
      params.append("estado", currentFilters.estado);
    }

    // Agregar filtros de fecha según el tipo
    if (currentFilters.tipoFecha === "especifica" && currentFilters.fechaEspecifica) {
      params.append("fechaEspecifica", currentFilters.fechaEspecifica);
    } else if (currentFilters.tipoFecha === "rango") {
      if (currentFilters.fechaDesde) params.append("fechaDesde", currentFilters.fechaDesde);
      if (currentFilters.fechaHasta) params.append("fechaHasta", currentFilters.fechaHasta);
    }

    return `/api/club-trekking/members?${params.toString()}`;
  };

  // Cargar miembros desde API
  const loadMembers = async (currentFilters: MembersFilters) => {
    setIsLoading(true);
    try {
      const url = buildFilterUrl(currentFilters);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error loading members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error loading club members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.nombre) count++;
    if (filters.apellido) count++;
    if (filters.estado && filters.estado !== "activa") count++; // "activa" es el default
    if (filters.tipoFecha === "especifica" && filters.fechaEspecifica) count++;
    if (filters.tipoFecha === "rango" && (filters.fechaDesde || filters.fechaHasta)) count++;
    return count;
  };

  const handleFiltersChange = (newFilters: MembersFilters) => {
    setFilters(newFilters);
    loadMembers(newFilters);
  };

  useEffect(() => {
    if (status === "loading") return;

    // Solo admin puede acceder
    if (!session?.user?.id || session.user.rol !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Cargar miembros inicialmente
    loadMembers(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user?.id || session.user.rol !== "admin") {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Club del Trekking"
        description="Gestión de miembros con suscripción activa"
      />

      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5" />
                  Miembros {filters.estado === "activa" ? "Activos" : filters.estado === "todas" ? "" : filters.estado}
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    "Cargando..."
                  ) : (
                    `Total de ${members.length} miembro${members.length !== 1 ? "s" : ""} encontrado${members.length !== 1 ? "s" : ""}`
                  )}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Componente de filtros */}
      <MembersFiltersComponent
        onFiltersChange={handleFiltersChange}
        activeFiltersCount={getActiveFiltersCount()}
      />

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Mountain className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay miembros activos</p>
              <p className="text-sm mt-2">
                Aún no hay suscriptores en el Club del Trekking
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Información del usuario */}
                  <div className="flex items-start gap-4 flex-1">
                    <UserAvatar
                      userId={member.userId}
                      firstName={member.firstname}
                      lastName={member.lastname}
                      className="h-16 w-16 rounded-full object-cover border shadow-sm"
                      size={128}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {member.firstname} {member.lastname}
                        </h3>
                        {member.penalizacionActiva && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Penalizado ({member.diasPenalizacion}d)
                          </Badge>
                        )}
                        {!member.penalizacionActiva && (
                          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{member.email}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Salidas realizadas</p>
                          <p className="font-medium">{member.salidasRealizadas} este mes</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Límite semanal</p>
                          <p className="font-medium">{member.limiteSemanal} salidas/semana</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fecha de inicio</p>
                          <p className="font-medium">
                            {new Date(member.fechaInicio).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próximo pago</p>
                          <p className="font-medium">
                            {new Date(member.proximaFechaPago).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>

                      {member.inasistenciasConsecutivas > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ {member.inasistenciasConsecutivas} inasistencia(s) consecutiva(s)
                            {member.inasistenciasConsecutivas >= 2 && " - Próxima: penalización de 3 días"}
                          </p>
                        </div>
                      )}

                      {member.preapprovalId && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Suscripción MP: {member.preapprovalId}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.mpStatus}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de detalles */}
                  <Button asChild>
                    <Link href={`/club-trekking/${member._id}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
