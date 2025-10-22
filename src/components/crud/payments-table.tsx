"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Check, X } from "lucide-react";
import type { Payment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (paymentId: string, newStatus: "aprobado" | "rechazado") => {
    setIsUpdating(paymentId);
    try {
      const res = await fetch(`/api/pagos/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el pago");
      }

      toast({
        title: "Pago actualizado",
        description: `El pago ha sido ${newStatus === "aprobado" ? "aprobado" : "rechazado"} exitosamente.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getEntityName = (payment: Payment) => {
    // Primero intentar obtener de los campos guardados (persisten aunque se borre la entidad)
    if ((payment as any).salidaNombre) {
      return (payment as any).salidaNombre;
    }
    if ((payment as any).academiaNombre) {
      return (payment as any).academiaNombre;
    }

    // Si no, intentar del populate
    if (payment.salidaId && typeof payment.salidaId === 'object') {
      return (payment.salidaId as any).nombre || "Salida";
    }
    if (payment.academiaId && typeof payment.academiaId === 'object') {
      return (payment.academiaId as any).nombre_academia || "Academia";
    }
    return "Sin especificar";
  };

  const getEntityType = (payment: Payment) => {
    if (payment.salidaId) return "Salida";
    if (payment.academiaId) return "Academia";
    return "Otro";
  };

  return (
    <>
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay pagos registrados</p>
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                const usuario = payment.userId && typeof payment.userId === 'object'
                  ? payment.userId as any
                  : null;

                return (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={usuario?.imagen || "https://ui-avatars.com/api/?name=User"}
                            alt={usuario?.firstname || "Usuario"}
                            data-ai-hint="person face"
                          />
                          <AvatarFallback>
                            {usuario?.firstname?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {usuario ? `${usuario.firstname} ${usuario.lastname}` : "Usuario"}
                          </p>
                          <p className="text-xs text-muted-foreground">{usuario?.email || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getEntityType(payment)}</TableCell>
                    <TableCell>{getEntityName(payment)}</TableCell>
                    <TableCell>${payment.amount || 0}</TableCell>
                    <TableCell>
                      {payment.createdAt ? format(new Date(payment.createdAt), "dd/MM/yyyy", { locale: es }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.estado === "aprobado"
                            ? "default"
                            : payment.estado === "rechazado"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          payment.estado === "aprobado"
                            ? "bg-green-500/20 text-green-700"
                            : payment.estado === "rechazado"
                            ? ""
                            : "bg-yellow-500/20 text-yellow-700"
                        }
                      >
                        {payment.estado === "aprobado"
                          ? "Aprobado"
                          : payment.estado === "rechazado"
                          ? "Rechazado"
                          : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating === payment._id}>
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {payment.comprobanteUrl && (
                            <DropdownMenuItem onClick={() => window.open(payment.comprobanteUrl, "_blank")}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Comprobante
                            </DropdownMenuItem>
                          )}
                          {payment.estado === "pendiente" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(payment._id, "aprobado")}
                                className="text-green-600"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Aprobar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(payment._id, "rechazado")}
                                className="text-destructive"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Rechazar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </div>

          {/* Vista Móvil - Cards */}
          <div className="md:hidden space-y-4">
            {payments.map((payment) => {
              const usuario = payment.userId && typeof payment.userId === 'object'
                ? payment.userId as any
                : null;

              return (
                <div key={payment._id} className="border rounded-lg p-4 space-y-4 bg-card">
                  {/* Header con usuario */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage
                        src={usuario?.imagen || "https://ui-avatars.com/api/?name=User"}
                        alt={usuario?.firstname || "Usuario"}
                        data-ai-hint="person face"
                      />
                      <AvatarFallback>
                        {usuario?.firstname?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">
                        {usuario ? `${usuario.firstname} ${usuario.lastname}` : "Usuario"}
                      </p>
                      <p className="text-sm text-muted-foreground break-all">
                        {usuario?.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Información del pago */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <span className="font-medium text-sm">{getEntityType(payment)}</span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-muted-foreground flex-shrink-0">Entidad:</span>
                      <span className="font-medium text-sm text-right">{getEntityName(payment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monto:</span>
                      <span className="font-bold text-lg">${payment.amount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fecha:</span>
                      <span className="font-medium text-sm">
                        {payment.createdAt ? format(new Date(payment.createdAt), "dd/MM/yyyy", { locale: es }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <Badge
                        variant={
                          payment.estado === "aprobado"
                            ? "default"
                            : payment.estado === "rechazado"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          payment.estado === "aprobado"
                            ? "bg-green-500/20 text-green-700 border-green-500"
                            : payment.estado === "rechazado"
                            ? ""
                            : "bg-yellow-500/20 text-yellow-700 border-yellow-500"
                        }
                      >
                        {payment.estado === "aprobado"
                          ? "Aprobado"
                          : payment.estado === "rechazado"
                          ? "Rechazado"
                          : "Pendiente"}
                      </Badge>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-2 pt-2 border-t">
                    {payment.comprobanteUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(payment.comprobanteUrl, "_blank")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Comprobante
                      </Button>
                    )}
                    {payment.estado === "pendiente" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(payment._id, "aprobado")}
                          disabled={isUpdating === payment._id}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUpdateStatus(payment._id, "rechazado")}
                          disabled={isUpdating === payment._id}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
