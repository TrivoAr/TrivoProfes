"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MemberFormDialog } from "@/components/forms/member-form-dialog";

interface MembersListProps {
  academiaId: string;
  miembros: any[];
  grupos: any[];
}

export function MembersList({
  academiaId,
  miembros: initialMiembros,
  grupos,
}: MembersListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [miembros, setMiembros] = useState(initialMiembros);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setEditingMember(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (member: any) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/miembros-academia/${selectedMember._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el miembro");
      }

      toast({
        title: "Miembro eliminado",
        description: `${selectedMember.usuario_id.firstname} ${selectedMember.usuario_id.lastname} ha sido eliminado de la academia.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el miembro. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingMember(null);
    router.refresh();
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge variant="default">Activo</Badge>;
      case "inactivo":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "suspendido":
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Miembros</CardTitle>
              <CardDescription>
                Gestiona los miembros de tu academia ({miembros.length}{" "}
                {miembros.length === 1 ? "miembro" : "miembros"})
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Miembro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {miembros.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aún no hay miembros en la academia
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Agrega usuarios como miembros para comenzar a gestionar tu academia
              </p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Miembro
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Membresía</TableHead>
                    <TableHead>Fecha de Unión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {miembros.map((miembro) => (
                    <TableRow key={miembro._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {miembro.usuario_id?.imagen ? (
                            <div className="relative h-10 w-10 rounded-full overflow-hidden">
                              <Image
                                src={miembro.usuario_id.imagen}
                                alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {miembro.usuario_id?.firstname}{" "}
                              {miembro.usuario_id?.lastname}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {miembro.usuario_id?.email}
                            </span>
                          </div>
                          {miembro.usuario_id?.telnumber && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{miembro.usuario_id.telnumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {miembro.grupo_id ? (
                          <Badge variant="outline">
                            {miembro.grupo_id.nombre_grupo}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sin grupo
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getEstadoBadge(miembro.estado)}</TableCell>
                      <TableCell>
                        {miembro.tipo_membresia ? (
                          <div className="space-y-1">
                            <p className="text-sm capitalize">
                              {miembro.tipo_membresia}
                            </p>
                            {miembro.fecha_vencimiento && (
                              <p className="text-xs text-muted-foreground">
                                Vence:{" "}
                                {new Date(
                                  miembro.fecha_vencimiento
                                ).toLocaleDateString("es-AR")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sin membresía
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(miembro.fecha_union).toLocaleDateString(
                            "es-AR"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(miembro)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(miembro)}
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
        </CardContent>
      </Card>

      <MemberFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        academiaId={academiaId}
        grupos={grupos}
        member={editingMember}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
              <strong>
                {selectedMember?.usuario_id?.firstname}{" "}
                {selectedMember?.usuario_id?.lastname}
              </strong>{" "}
              de la academia.
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
