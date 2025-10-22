"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academiaId: string;
  grupos: any[];
  member?: any;
  onSuccess?: () => void;
}

const TIPOS_MEMBRESIA = [
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const ESTADOS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
];

export function MemberFormDialog({
  open,
  onOpenChange,
  academiaId,
  grupos,
  member,
  onSuccess,
}: MemberFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    grupo_id: "",
    estado: "activo",
    tipo_membresia: "",
    fecha_vencimiento: "",
    notas: "",
  });

  // Cargar datos del miembro si estamos editando
  useEffect(() => {
    if (member) {
      setFormData({
        grupo_id: member.grupo_id?._id || "",
        estado: member.estado || "activo",
        tipo_membresia: member.tipo_membresia || "",
        fecha_vencimiento: member.fecha_vencimiento
          ? new Date(member.fecha_vencimiento).toISOString().split("T")[0]
          : "",
        notas: member.notas || "",
      });
      setSelectedUser(member.usuario_id);
    } else {
      // Reset form para crear nuevo miembro
      setFormData({
        grupo_id: "",
        estado: "activo",
        tipo_membresia: "",
        fecha_vencimiento: "",
        notas: "",
      });
      setSelectedUser(null);
      setSearchEmail("");
    }
  }, [member, open]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un email para buscar",
        variant: "destructive",
      });
      return;
    }

    setSearchingUser(true);
    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(searchEmail)}`
      );

      if (!response.ok) {
        throw new Error("Usuario no encontrado");
      }

      const users = await response.json();
      if (users.length === 0) {
        toast({
          title: "No encontrado",
          description: "No se encontró ningún usuario con ese email",
          variant: "destructive",
        });
        return;
      }

      // Tomar el primer usuario que coincida con el email exacto
      const user = users.find(
        (u: any) => u.email.toLowerCase() === searchEmail.toLowerCase()
      );

      if (!user) {
        toast({
          title: "No encontrado",
          description: "No se encontró ningún usuario con ese email",
          variant: "destructive",
        });
        return;
      }

      setSelectedUser(user);
      toast({
        title: "Usuario encontrado",
        description: `${user.firstname} ${user.lastname}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo buscar el usuario",
        variant: "destructive",
      });
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!member && !selectedUser) {
        toast({
          title: "Error",
          description: "Debes buscar y seleccionar un usuario",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Preparar datos
      const dataToSend = {
        academia_id: academiaId,
        usuario_id: member ? member.usuario_id._id : selectedUser._id,
        grupo_id: formData.grupo_id || undefined,
        estado: formData.estado,
        tipo_membresia: formData.tipo_membresia || undefined,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        notas: formData.notas || undefined,
      };

      // Crear o actualizar miembro
      const url = member
        ? `/api/miembros-academia/${member._id}`
        : "/api/miembros-academia";
      const method = member ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar el miembro");
      }

      toast({
        title: member ? "Miembro actualizado" : "Miembro agregado",
        description: member
          ? "El miembro ha sido actualizado exitosamente"
          : `${selectedUser.firstname} ${selectedUser.lastname} ha sido agregado como miembro`,
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el miembro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {member ? "Editar Miembro" : "Agregar Nuevo Miembro"}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Modifica los datos del miembro"
              : "Busca un usuario por email y agrégalo como miembro de la academia"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buscar Usuario (solo al crear) */}
          {!member && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buscar Usuario</h3>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="searchEmail">Email del usuario</Label>
                  <Input
                    id="searchEmail"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    disabled={!!selectedUser}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleSearchUser}
                    disabled={searchingUser || !!selectedUser}
                  >
                    {searchingUser ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {selectedUser && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {selectedUser.imagen ? (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={selectedUser.imagen}
                          alt={`${selectedUser.firstname} ${selectedUser.lastname}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {selectedUser.firstname?.[0]}
                          {selectedUser.lastname?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchEmail("");
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usuario seleccionado al editar */}
          {member && member.usuario_id && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Usuario</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {member.usuario_id.imagen ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={member.usuario_id.imagen}
                        alt={`${member.usuario_id.firstname} ${member.usuario_id.lastname}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {member.usuario_id.firstname?.[0]}
                        {member.usuario_id.lastname?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {member.usuario_id.firstname} {member.usuario_id.lastname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.usuario_id.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información del Miembro */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Miembro</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grupo_id">Grupo (Opcional)</Label>
                <Select
                  value={formData.grupo_id}
                  onValueChange={(value) => handleSelectChange("grupo_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin grupo asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin grupo</SelectItem>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo._id} value={grupo._id}>
                        {grupo.nombre_grupo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleSelectChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo_membresia">Tipo de Membresía</Label>
                <Select
                  value={formData.tipo_membresia}
                  onValueChange={(value) =>
                    handleSelectChange("tipo_membresia", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin membresía" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin membresía</SelectItem>
                    {TIPOS_MEMBRESIA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fecha_vencimiento"
                  name="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Notas adicionales sobre el miembro..."
                rows={4}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || (!member && !selectedUser)}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? "Guardando..."
                : member
                ? "Actualizar Miembro"
                : "Agregar Miembro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
