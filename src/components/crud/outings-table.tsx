"use client";

import { useState, useMemo, useCallback } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FilePenLine, Trash2, Eye, Users, Share2 } from "lucide-react";
import type { SocialOuting } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  OutingsFiltersComponent,
  type OutingsFilters,
} from "./outings-filters";

export function OutingsTable({ outings }: { outings: SocialOuting[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOuting, setSelectedOuting] = useState<SocialOuting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<OutingsFilters>({});

  const handleView = (id: string) => {
    router.push(`/outings/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/outings/${id}/edit`);
  };

  const handleMembers = (id: string) => {
    router.push(`/outings/${id}/miembros`);
  };

  const handleCopyLink = async (outing: SocialOuting) => {
    const shareLink = `https://trivo.com.ar/s/${outing.shortId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copiado",
        description: "El link de la salida ha sido copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (outing: SocialOuting) => {
    setSelectedOuting(outing);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOuting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/salidas/${selectedOuting._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la salida");
      }

      toast({
        title: "Salida eliminada",
        description: `La salida "${selectedOuting.nombre}" ha sido eliminada exitosamente.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la salida. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedOuting(null);
    }
  };

  const getEstado = (salida: SocialOuting) => {
    if (!salida.fecha) return "sin-fecha";
    const fechaSalida = new Date(salida.fecha);
    const hoy = new Date();
    return fechaSalida > hoy ? "activa" : "finalizada";
  };

  const formatFechaHora = (fecha?: string, hora?: string) => {
    if (!fecha) return "Sin fecha";
    try {
      const fechaObj = new Date(fecha);
      const fechaStr = format(fechaObj, "dd/MM/yyyy", { locale: es });
      return hora ? `${fechaStr} - ${hora}` : fechaStr;
    } catch {
      return "Fecha inválida";
    }
  };

  // Extraer precio numérico del string
  const extractPrecio = (precioStr?: string): number | null => {
    if (!precioStr) return null;
    // Si es "Gratis" o similar, retornar 0
    if (precioStr.toLowerCase().includes("gratis") || precioStr.toLowerCase().includes("free")) {
      return 0;
    }
    // Extraer números del string
    const match = precioStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  // Filtrar salidas según los filtros activos
  const filteredOutings = useMemo(() => {
    return outings.filter((outing) => {
      // Filtro por fecha desde
      if (filters.fechaDesde && outing.fecha) {
        const fechaOuting = new Date(outing.fecha);
        const fechaDesde = new Date(filters.fechaDesde);
        if (fechaOuting < fechaDesde) return false;
      }

      // Filtro por fecha hasta
      if (filters.fechaHasta && outing.fecha) {
        const fechaOuting = new Date(outing.fecha);
        const fechaHasta = new Date(filters.fechaHasta);
        if (fechaOuting > fechaHasta) return false;
      }

      // Filtro por precio mínimo
      if (filters.precioMin) {
        const precio = extractPrecio(outing.precio);
        if (precio === null || precio < parseInt(filters.precioMin, 10)) {
          return false;
        }
      }

      // Filtro por precio máximo
      if (filters.precioMax) {
        const precio = extractPrecio(outing.precio);
        if (precio === null || precio > parseInt(filters.precioMax, 10)) {
          return false;
        }
      }

      // Filtro por provincia
      if (filters.provincia && outing.provincia !== filters.provincia) {
        return false;
      }

      // Filtro por localidad
      if (filters.localidad && outing.localidad !== filters.localidad) {
        return false;
      }

      // Filtro por deporte
      if (filters.deporte && outing.deporte !== filters.deporte) {
        return false;
      }

      return true;
    });
  }, [outings, filters]);

  const handleFilterChange = useCallback((newFilters: OutingsFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      {/* Componente de Filtros */}
      <OutingsFiltersComponent outings={outings} onFilterChange={handleFilterChange} />

      {outings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No hay salidas sociales registradas</p>
          <Button onClick={() => router.push("/outings/crear")}>
            Crear Primera Salida
          </Button>
        </div>
      ) : filteredOutings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No se encontraron salidas con los filtros aplicados
          </p>
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Cupo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutings.map((outing) => {
                  const estado = getEstado(outing);
                  return (
                    <TableRow key={outing._id}>
                    <TableCell className="font-medium">{outing.nombre}</TableCell>
                    <TableCell>{outing.deporte || "Sin especificar"}</TableCell>
                    <TableCell>{formatFechaHora(outing.fecha, outing.hora)}</TableCell>
                    <TableCell>
                      {outing.localidad && outing.provincia
                        ? `${outing.localidad}, ${outing.provincia}`
                        : outing.localidad || outing.provincia || "Sin ubicación"}
                    </TableCell>
                    <TableCell>
                      <span className={outing.participantes === outing.cupo ? "text-red-600 font-semibold" : ""}>
                        {outing.participantes || 0}/{outing.cupo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={estado === "activa" ? "default" : "secondary"}
                        className={estado === "activa" ? "bg-green-500/20 text-green-700" : ""}
                      >
                        {estado === "activa" ? "Activa" : "Finalizada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(outing._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(outing)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartir Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMembers(outing._id)}>
                            <Users className="mr-2 h-4 w-4" />
                            Gestionar Miembros
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(outing._id)}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(outing)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
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
            {filteredOutings.map((outing) => {
              const estado = getEstado(outing);
              return (
                <div key={outing._id} className="border rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{outing.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{outing.deporte || "Sin especificar"}</p>
                    </div>
                    <Badge
                      variant={estado === "activa" ? "default" : "secondary"}
                      className={estado === "activa" ? "bg-green-500/20 text-green-700" : ""}
                    >
                      {estado === "activa" ? "Activa" : "Finalizada"}
                    </Badge>
                  </div>

                  {/* Información */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">{formatFechaHora(outing.fecha, outing.hora)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span className="font-medium text-right">
                        {outing.localidad && outing.provincia
                          ? `${outing.localidad}, ${outing.provincia}`
                          : outing.localidad || outing.provincia || "Sin ubicación"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cupo:</span>
                      <span className={`font-medium ${outing.participantes === outing.cupo ? "text-red-600" : ""}`}>
                        {outing.participantes || 0}/{outing.cupo}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(outing._id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMembers(outing._id)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Miembros
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(outing)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Compartir Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(outing._id)}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(outing)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la salida{" "}
              <strong>"{selectedOuting?.nombre}"</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
