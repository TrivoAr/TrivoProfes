"use client";

import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, ArrowUpDown, Edit, Trash2, Plus } from "lucide-react";
import type { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserFormDialog } from "@/components/forms/user-form-dialog";

type SortField = "firstname" | "email" | "rol" | "createdAt";
type SortOrder = "asc" | "desc";

export function MembersTable({ members: initialMembers }: { members: User[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Obtener roles únicos
  const uniqueRoles = useMemo(() => {
    const roles = new Set(members.map(m => m.rol));
    return Array.from(roles);
  }, [members]);

  // Filtrar y ordenar miembros
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter((member) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        member.firstname.toLowerCase().includes(searchLower) ||
        member.lastname.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower);

      const matchesRole = roleFilter === "all" || member.rol === roleFilter;

      return matchesSearch && matchesRole;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "firstname":
          aValue = a.firstname.toLowerCase();
          bValue = b.firstname.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "rol":
          aValue = a.rol.toLowerCase();
          bValue = b.rol.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [members, searchTerm, roleFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setFormDialogOpen(true);
  };

  const handleCreateClick = () => {
    setUserToEdit(null);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users/${userToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar usuario");
      }

      // Actualizar la lista de miembros
      setMembers(members.filter(m => m._id !== userToDelete._id));

      toast({
        title: "Usuario eliminado",
        description: `${userToDelete.firstname} ${userToDelete.lastname} ha sido eliminado correctamente.`,
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "admin":
        return "bg-purple-500/20 text-purple-700";
      case "profe":
        return "bg-blue-500/20 text-blue-700";
      case "dueño de academia":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const getRoleName = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Administrador";
      case "profe":
        return "Profesor";
      case "dueño de academia":
        return "Dueño de Academia";
      case "alumno":
        return "Alumno";
      default:
        return rol;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Botón de crear y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Vista Desktop - Tabla */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("firstname")}
                    className="flex items-center gap-1 hover:bg-transparent p-0"
                  >
                    Usuario
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("email")}
                    className="flex items-center gap-1 hover:bg-transparent p-0"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("rol")}
                    className="flex items-center gap-1 hover:bg-transparent p-0"
                  >
                    Rol
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-1 hover:bg-transparent p-0"
                  >
                    Fecha de Registro
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.imagen || `https://ui-avatars.com/api/?name=${member.firstname}+${member.lastname}`}
                            alt={`${member.firstname} ${member.lastname}`}
                            data-ai-hint="person face"
                          />
                          <AvatarFallback>
                            {member.firstname[0]}{member.lastname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <p className="font-medium">
                            {member.firstname} {member.lastname}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getRoleBadgeColor(member.rol)}
                      >
                        {getRoleName(member.rol)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {member.telnumber || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
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
                          <DropdownMenuItem onClick={() => handleEditClick(member)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil - Cards */}
        <div className="md:hidden space-y-4">
          {filteredAndSortedMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              No se encontraron usuarios
            </div>
          ) : (
            filteredAndSortedMembers.map((member) => (
              <div key={member._id} className="border rounded-lg p-4 space-y-4 bg-card">
                {/* Header con avatar y usuario */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage
                      src={member.imagen || `https://ui-avatars.com/api/?name=${member.firstname}+${member.lastname}`}
                      alt={`${member.firstname} ${member.lastname}`}
                      data-ai-hint="person face"
                    />
                    <AvatarFallback>
                      {member.firstname[0]}{member.lastname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">
                      {member.firstname} {member.lastname}
                    </p>
                    <p className="text-sm text-muted-foreground break-all">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Información del usuario */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rol:</span>
                    <Badge
                      variant="secondary"
                      className={getRoleBadgeColor(member.rol)}
                    >
                      {getRoleName(member.rol)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Teléfono:</span>
                    <span className="font-medium text-sm">
                      {member.telnumber || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Registro:</span>
                    <span className="font-medium text-sm">
                      {new Date(member.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(member)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredAndSortedMembers.length} de {members.length} usuarios
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario{" "}
              <span className="font-semibold">
                {userToDelete?.firstname} {userToDelete?.lastname}
              </span>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de formulario crear/editar */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={userToEdit}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
