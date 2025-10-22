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
import { MoreHorizontal, FilePenLine, Trash2, Eye } from "lucide-react";
import type { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TeamsTable({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = (id: string) => {
    router.push(`/teams/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/teams/${id}/editar`);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeam._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el equipo");
      }

      toast({
        title: "Equipo eliminado",
        description: `El equipo "${selectedTeam.nombre}" ha sido eliminado exitosamente.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
    }
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

  return (
    <>
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No hay equipos registrados</p>
          <Button onClick={() => router.push("/teams/crear")}>
            Crear Primer Equipo
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Deporte</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Cupo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team._id}>
                  <TableCell className="font-medium">{team.nombre}</TableCell>
                  <TableCell>{team.deporte}</TableCell>
                  <TableCell>{formatFechaHora(team.fecha, team.hora)}</TableCell>
                  <TableCell>
                    {team.localidad && team.provincia
                      ? `${team.localidad}, ${team.provincia}`
                      : team.ubicacion}
                  </TableCell>
                  <TableCell>{team.cupo}</TableCell>
                  <TableCell>${team.precio}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(team._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(team._id)}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(team)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el equipo{" "}
              <strong>"{selectedTeam?.nombre}"</strong> y todos sus datos asociados.
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
