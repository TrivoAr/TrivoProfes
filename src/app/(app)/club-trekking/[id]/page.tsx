"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mountain,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock,
  TrendingUp,
  Mail,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ClubMemberDetail {
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
  historialSalidas: Array<{
    salidaId: string;
    fecha: Date;
    checkInRealizado: boolean;
    asistenciaConfirmada: boolean | null;
  }>;
  historialPenalizaciones: Array<{
    fechaInicio: Date;
    fechaFin: Date;
    motivo: string;
    inasistenciasConsecutivas: number;
  }>;
}

export default function ClubMemberDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [member, setMember] = useState<ClubMemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    // Solo admin puede acceder
    if (!session?.user?.id || session.user.rol !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Cargar detalle del miembro
    async function loadMemberDetail() {
      try {
        const response = await fetch(`/api/club-trekking/members/${params.id}`);
        if (!response.ok) throw new Error("Error loading member detail");
        const data = await response.json();
        setMember(data);
      } catch (error) {
        console.error("Error loading member detail:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMemberDetail();
  }, [session, status, router, params.id]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user?.id || session.user.rol !== "admin" || !member) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/club-trekking">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a miembros
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${member.firstname} ${member.lastname}`}
        description="Detalle del miembro del Club del Trekking"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información personal */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <UserAvatar
                userId={member.userId}
                firstName={member.firstname}
                lastName={member.lastname}
                className="h-24 w-24 rounded-full object-cover border shadow-sm mb-4"
                size={192}
              />
              <h3 className="text-xl font-semibold text-center">
                {member.firstname} {member.lastname}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                {member.penalizacionActiva ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Penalizado ({member.diasPenalizacion}d)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Activo
                  </Badge>
                )}
              </div>

              {member.inasistenciasConsecutivas > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ {member.inasistenciasConsecutivas} inasistencia(s) consecutiva(s)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de suscripción */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mountain className="h-5 w-5" />
              Información de Suscripción
            </CardTitle>
            <CardDescription>Detalles de la membresía del Club del Trekking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de inicio
                </div>
                <p className="text-lg font-semibold">
                  {new Date(member.fechaInicio).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  Próximo pago
                </div>
                <p className="text-lg font-semibold">
                  {new Date(member.proximaFechaPago).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Salidas este mes
                </div>
                <p className="text-lg font-semibold">
                  {member.salidasRealizadas} / {member.limiteSemanal} por semana
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Vencimiento
                </div>
                <p className="text-lg font-semibold">
                  {new Date(member.fechaFin).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {member.preapprovalId && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" />
                  Información de MercadoPago
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID de suscripción:</span>
                    <span className="font-mono">{member.preapprovalId}</span>
                  </div>
                  {member.payerEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email de pago:</span>
                      <span>{member.payerEmail}</span>
                    </div>
                  )}
                  {member.mpStatus && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant="outline">{member.mpStatus}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de salidas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historial de Salidas</CardTitle>
          <CardDescription>
            Registro de todas las salidas del miembro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!member.historialSalidas || member.historialSalidas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay salidas registradas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {member.historialSalidas.map((salida, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(salida.fecha).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {salida.salidaId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {salida.asistenciaConfirmada === true && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Asistió
                      </Badge>
                    )}
                    {salida.asistenciaConfirmada === false && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No asistió
                      </Badge>
                    )}
                    {salida.asistenciaConfirmada === null && (
                      <Badge variant="outline">
                        Pendiente confirmación
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de penalizaciones */}
      {member.historialPenalizaciones && member.historialPenalizaciones.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400">
              Historial de Penalizaciones
            </CardTitle>
            <CardDescription>
              Registro de penalizaciones anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {member.historialPenalizaciones.map((pen, index) => (
                <div
                  key={index}
                  className="p-4 border border-orange-200 dark:border-orange-900 rounded-lg bg-orange-50 dark:bg-orange-950/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        {pen.motivo}
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        {new Date(pen.fechaInicio).toLocaleDateString('es-AR')} -{" "}
                        {new Date(pen.fechaFin).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {pen.inasistenciasConsecutivas} inasistencias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
