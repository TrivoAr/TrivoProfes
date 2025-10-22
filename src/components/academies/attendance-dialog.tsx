"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: any;
  academiaId: string;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  grupo,
  academiaId,
}: AttendanceDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSuscripciones();
      setSelectedUsers(new Set());
    }
  }, [open, grupo]);

  const fetchSuscripciones = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/subscriptions/academia/${academiaId}`);
      if (!res.ok) throw new Error("Error al cargar suscripciones");

      const data = await res.json();

      // Filtrar solo suscripciones activas o en trial del grupo específico (o sin grupo asignado)
      const suscripcionesValidas = data.suscripciones.filter(
        (s: any) =>
          (s.estado === "trial" || s.estado === "activa") &&
          (!s.grupoId || s.grupoId._id === grupo._id)
      );

      setSuscripciones(suscripcionesValidas);
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

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === suscripciones.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(suscripciones.map((s) => s.userId._id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Advertencia",
        description: "Selecciona al menos un usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const promises = Array.from(selectedUsers).map((userId) =>
        fetch("/api/asistencias/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            academiaId,
            grupoId: grupo._id,
          }),
        })
      );

      const results = await Promise.all(promises);

      let trialExpiradoCount = 0;
      const responses = await Promise.all(results.map(r => r.json()));

      responses.forEach(data => {
        if (data.trialExpirado) {
          trialExpiradoCount++;
        }
      });

      toast({
        title: "Asistencias registradas",
        description: trialExpiradoCount > 0
          ? `${selectedUsers.size} asistencias registradas. ${trialExpiradoCount} usuarios agotaron su prueba gratis y deben activar su suscripción.`
          : `${selectedUsers.size} asistencias registradas correctamente`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar asistencias",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoBadge = (suscripcion: any) => {
    if (suscripcion.estado === "trial") {
      const clasesRestantes = 1 - (suscripcion.trial?.clasesAsistidas || 0);
      const diasRestantes = suscripcion.trial?.fechaFin
        ? Math.ceil(
            (new Date(suscripcion.trial.fechaFin).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return (
        <Badge variant="default" className="gap-1">
          <Clock className="h-3 w-3" />
          Trial ({clasesRestantes} clase, {Math.max(0, diasRestantes)} días)
        </Badge>
      );
    }

    if (suscripcion.estado === "activa") {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Activa
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        {suscripcion.estado}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia</DialogTitle>
          <DialogDescription>
            Marca a los usuarios que asistieron a la clase de{" "}
            <span className="font-semibold">{grupo.nombre_grupo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : suscripciones.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay usuarios suscritos a este grupo
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.size} de {suscripciones.length} seleccionados
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedUsers.size === suscripciones.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suscripciones.map((suscripcion) => (
                      <TableRow key={suscripcion._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(suscripcion.userId._id)}
                            onCheckedChange={() =>
                              handleToggleUser(suscripcion.userId._id)
                            }
                          />
                        </TableCell>
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
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(suscripcion)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {suscripcion.userId?.email}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Importante
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>
                    Los usuarios en <strong>trial</strong> consumirán su clase gratis
                  </li>
                  <li>
                    Al consumir 1 clase o pasar 7 días, el trial expira y deben activar la suscripción
                  </li>
                  <li>
                    Los usuarios con suscripción <strong>activa</strong> ya pagaron
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedUsers.size === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    `Registrar ${selectedUsers.size} asistencia${
                      selectedUsers.size !== 1 ? "s" : ""
                    }`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
