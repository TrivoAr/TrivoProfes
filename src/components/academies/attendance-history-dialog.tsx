"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: any;
}

export function AttendanceHistoryDialog({
  open,
  onOpenChange,
  grupo,
}: AttendanceHistoryDialogProps) {
  const { toast } = useToast();
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [asistenciasPorFecha, setAsistenciasPorFecha] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAsistencias();
    }
  }, [open, grupo]);

  const fetchAsistencias = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/asistencias/grupo/${grupo._id}`);
      if (!res.ok) throw new Error("Error al cargar asistencias");

      const data = await res.json();
      setAsistencias(data.asistencias);
      setEstadisticas(data.estadisticas);
      setAsistenciasPorFecha(data.asistenciasPorFecha);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las asistencias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Asistencias</DialogTitle>
          <DialogDescription>
            Registro de asistencias del grupo{" "}
            <span className="font-semibold">{grupo.nombre_grupo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              {estadisticas && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Total Asistencias
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        {estadisticas.total}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Clases Trial
                      </CardDescription>
                      <CardTitle className="text-2xl text-blue-600">
                        {estadisticas.asistenciasTrial}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Clases Pagas
                      </CardDescription>
                      <CardTitle className="text-2xl text-green-600">
                        {estadisticas.asistenciasPagas}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Usuarios Únicos
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        {estadisticas.usuariosUnicos}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {asistencias.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aún no hay asistencias registradas
                  </p>
                </div>
              ) : (
                <>
                  {/* Asistencias agrupadas por fecha */}
                  <div className="space-y-4">
                    {Object.keys(asistenciasPorFecha)
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                      .map((fecha) => (
                        <Card key={fecha}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              {formatFechaCorta(fecha)}
                              <Badge variant="secondary" className="ml-2">
                                {asistenciasPorFecha[fecha].length} asistencia
                                {asistenciasPorFecha[fecha].length !== 1 ? "s" : ""}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Registrado por</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {asistenciasPorFecha[fecha].map(
                                    (asistencia: any) => (
                                      <TableRow key={asistencia._id}>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            {asistencia.userId?.imagen ? (
                                              <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                                <Image
                                                  src={asistencia.userId.imagen}
                                                  alt={`${asistencia.userId.firstname} ${asistencia.userId.lastname}`}
                                                  fill
                                                  className="object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                              </div>
                                            )}
                                            <div>
                                              <p className="font-medium text-sm">
                                                {asistencia.userId?.firstname}{" "}
                                                {asistencia.userId?.lastname}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {asistencia.userId?.email}
                                              </p>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {asistencia.esTrial ? (
                                            <Badge
                                              variant="default"
                                              className="gap-1"
                                            >
                                              <Clock className="h-3 w-3" />
                                              Trial
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="default"
                                              className="gap-1 bg-green-600"
                                            >
                                              <CheckCircle2 className="h-3 w-3" />
                                              Paga
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {new Date(
                                            asistencia.fecha
                                          ).toLocaleTimeString("es-AR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {asistencia.registradoPor?.firstname}{" "}
                                          {asistencia.registradoPor?.lastname}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
