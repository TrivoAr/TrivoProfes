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
  Calendar,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  History,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GroupFormDialog } from "@/components/forms/group-form-dialog";
import { AttendanceDialog } from "@/components/academies/attendance-dialog";
import { AttendanceHistoryDialog } from "@/components/academies/attendance-history-dialog";

interface GroupsListProps {
  academiaId: string;
  grupos: any[];
}

export function GroupsList({ academiaId, grupos: initialGrupos }: GroupsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [grupos, setGrupos] = useState(initialGrupos);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceGroup, setAttendanceGroup] = useState<any | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyGroup, setHistoryGroup] = useState<any | null>(null);

  const handleCreate = () => {
    setEditingGroup(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (group: any) => {
    setEditingGroup(group);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (group: any) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/grupos/${selectedGroup._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el grupo");
      }

      toast({
        title: "Grupo eliminado",
        description: `El grupo "${selectedGroup.nombre_grupo}" ha sido eliminado exitosamente.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingGroup(null);
    router.refresh();
  };

  const handleOpenAttendance = (group: any) => {
    setAttendanceGroup(group);
    setAttendanceDialogOpen(true);
  };

  const handleOpenHistory = (group: any) => {
    setHistoryGroup(group);
    setHistoryDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grupos</CardTitle>
              <CardDescription>
                Gestiona los grupos de entrenamiento de tu academia
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {grupos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aún no hay grupos creados
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Crea grupos de entrenamiento para organizar tus clases
              </p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Grupo
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupos.map((grupo) => (
                <Card key={grupo._id} className="overflow-hidden">
                  {grupo.imagen && (
                    <div className="relative w-full h-40">
                      <Image
                        src={grupo.imagen}
                        alt={grupo.nombre_grupo}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {grupo.nombre_grupo}
                        </CardTitle>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {grupo.nivel && (
                            <Badge variant="secondary">{grupo.nivel}</Badge>
                          )}
                          {grupo.tipo_grupo && (
                            <Badge variant="outline">{grupo.tipo_grupo}</Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(grupo)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenHistory(grupo)}>
                            <History className="mr-2 h-4 w-4" />
                            Ver Historial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(grupo)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {grupo.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {grupo.descripcion}
                      </p>
                    )}

                    <div className="space-y-1 text-sm">
                      {grupo.dias && grupo.dias.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{grupo.dias.join(", ")}</span>
                        </div>
                      )}

                      {grupo.horario && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{grupo.horario}</span>
                        </div>
                      )}

                      {grupo.ubicacion && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{grupo.ubicacion}</span>
                        </div>
                      )}

                      {grupo.tiempo_promedio && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duración: {grupo.tiempo_promedio}</span>
                        </div>
                      )}
                    </div>

                    {grupo.profesor_id && (
                      <div className="pt-2 border-t mt-2">
                        <div className="flex items-center gap-2">
                          {grupo.profesor_id.imagen ? (
                            <div className="relative h-6 w-6 rounded-full overflow-hidden">
                              <Image
                                src={grupo.profesor_id.imagen}
                                alt={`${grupo.profesor_id.firstname} ${grupo.profesor_id.lastname}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {grupo.profesor_id.firstname}{" "}
                            {grupo.profesor_id.lastname}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Botón de registrar asistencia */}
                    <div className="pt-3">
                      <Button
                        onClick={() => handleOpenAttendance(grupo)}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Registrar Asistencia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GroupFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        academiaId={academiaId}
        group={editingGroup}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              grupo <strong>"{selectedGroup?.nombre_grupo}"</strong>.
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

      {attendanceGroup && (
        <AttendanceDialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
          grupo={attendanceGroup}
          academiaId={academiaId}
        />
      )}

      {historyGroup && (
        <AttendanceHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          grupo={historyGroup}
        />
      )}
    </>
  );
}
