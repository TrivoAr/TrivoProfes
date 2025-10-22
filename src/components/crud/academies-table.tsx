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
import { MoreHorizontal, FilePenLine, Trash2, Eye, Plus } from "lucide-react";
import type { Academy } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AcademyFormDialog } from "@/components/forms/academy-form-dialog";

export function AcademiesTable({ academies }: { academies: Academy[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);

  const handleView = (id: string) => {
    router.push(`/academies/${id}`);
  };

  const handleEdit = (academy: Academy) => {
    setEditingAcademy(academy);
    setFormDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAcademy(null);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingAcademy(null);
    router.refresh();
  };

  const openDeleteDialog = (academy: Academy) => {
    setSelectedAcademy(academy);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAcademy) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/academias/${selectedAcademy._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la academia");
      }

      toast({
        title: "Academia eliminada",
        description: `La academia "${selectedAcademy.nombre_academia}" ha sido eliminada exitosamente.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la academia. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedAcademy(null);
    }
  };

  return (
    <>
      {academies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Aún no tienes una academia registrada</p>
          <p className="text-sm text-muted-foreground mb-6">
            Puedes crear una academia para gestionar tus clases y membresías.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Mi Academia
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Clase Gratis</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academies.map((academy) => (
                <TableRow key={academy._id}>
                  <TableCell className="font-medium">{academy.nombre_academia}</TableCell>
                  <TableCell>{academy.tipo_disciplina}</TableCell>
                  <TableCell>
                    {academy.localidad}, {academy.provincia}
                  </TableCell>
                  <TableCell>{academy.precio ? `$${academy.precio}` : "Gratis"}</TableCell>
                  <TableCell>
                    <Badge variant={academy.clase_gratis ? "default" : "secondary"}>
                      {academy.clase_gratis ? "Sí" : "No"}
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
                        <DropdownMenuItem onClick={() => handleView(academy._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(academy)}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(academy)}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la academia{" "}
              <strong>"{selectedAcademy?.nombre_academia}"</strong> y todos sus datos asociados.
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

      <AcademyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        academy={editingAcademy}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
