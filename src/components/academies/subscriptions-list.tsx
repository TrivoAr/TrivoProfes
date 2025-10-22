"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionsListProps {
  academiaId: string;
}

export function SubscriptionsList({ academiaId }: SubscriptionsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuscripciones();
  }, [academiaId]);

  const fetchSuscripciones = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/subscriptions/academia/${academiaId}`);
      if (!res.ok) {
        throw new Error("Error al cargar suscripciones");
      }
      const data = await res.json();
      setSuscripciones(data.suscripciones);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las suscripciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: any; icon: any; label: string }> = {
      trial: {
        variant: "default",
        icon: Clock,
        label: "Prueba",
      },
      activa: {
        variant: "default",
        icon: CheckCircle2,
        label: "Activa",
      },
      trial_expirado: {
        variant: "destructive",
        icon: AlertCircle,
        label: "Prueba Expirada",
      },
      pendiente: {
        variant: "outline",
        icon: Clock,
        label: "Pendiente",
      },
      vencida: {
        variant: "destructive",
        icon: XCircle,
        label: "Vencida",
      },
      pausada: {
        variant: "secondary",
        icon: AlertCircle,
        label: "Pausada",
      },
      cancelada: {
        variant: "secondary",
        icon: XCircle,
        label: "Cancelada",
      },
    };

    const config = badges[estado] || badges.pendiente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatFecha = (fecha: string | Date | undefined) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suscripciones</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suscripciones</CardTitle>
            <CardDescription>
              Miembros suscritos a tu academia
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">{estadisticas.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Activas</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {estadisticas.activas}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En Prueba</CardDescription>
                <CardTitle className="text-2xl text-blue-600">
                  {estadisticas.trial}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pendientes</CardDescription>
                <CardTitle className="text-2xl text-orange-600">
                  {estadisticas.trial_expirado + estadisticas.pendientes}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {suscripciones.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Aún no hay suscripciones
            </p>
            <p className="text-sm text-muted-foreground">
              Los usuarios podrán suscribirse a tu academia desde la aplicación
              principal
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Próximo Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suscripciones.map((suscripcion) => (
                  <TableRow key={suscripcion._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {suscripcion.userId?.imagen ? (
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={suscripcion.userId.imagen}
                              alt={`${suscripcion.userId.firstname} ${suscripcion.userId.lastname}`}
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
                            {suscripcion.userId?.firstname}{" "}
                            {suscripcion.userId?.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suscripcion.userId?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {suscripcion.grupoId?.nombre_grupo || "-"}
                    </TableCell>
                    <TableCell>{getEstadoBadge(suscripcion.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {suscripcion.pagos?.monto || 0}{" "}
                          {suscripcion.pagos?.moneda || "ARS"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatFecha(suscripcion.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {suscripcion.trial?.estaEnTrial
                        ? `Trial: ${formatFecha(suscripcion.trial.fechaFin)}`
                        : formatFecha(suscripcion.pagos?.proximaFechaPago)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
