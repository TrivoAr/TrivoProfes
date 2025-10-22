"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import type { User } from "@/lib/types";
import { ImageService } from "@/services/ImageService";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    rol: "alumno",
    telnumber: "",
    bio: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "", // No prellenar password por seguridad
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        rol: user.rol || "alumno",
        telnumber: user.telnumber || "",
        bio: user.bio || "",
        instagram: user.instagram || "",
        facebook: user.facebook || "",
        twitter: user.twitter || "",
      });

      // Si hay imagen existente, mostrarla
      if (user.imagen) {
        setExistingImageUrl(user.imagen);
        setImagePreview(user.imagen);
      }
    } else {
      // Reset form si no hay usuario (crear nuevo)
      setFormData({
        email: "",
        password: "",
        firstname: "",
        lastname: "",
        rol: "alumno",
        telnumber: "",
        bio: "",
        instagram: "",
        facebook: "",
        twitter: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setExistingImageUrl(null);
    }
  }, [user, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rol: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar el archivo
    const validation = ImageService.validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Guardar el archivo
    setImageFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!formData.email.trim() || !formData.firstname.trim() || !formData.lastname.trim()) {
        toast({
          title: "Error",
          description: "Email, nombre y apellido son campos requeridos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar password solo al crear nuevo usuario
      if (!user && !formData.password.trim()) {
        toast({
          title: "Error",
          description: "La contraseña es requerida para crear un nuevo usuario",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar longitud de password
      if (formData.password && formData.password.length < 6) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 6 caracteres",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Error",
          description: "El formato del email no es válido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Primero crear/actualizar el usuario
      const url = user ? `/api/users/${user._id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      // Preparar datos - solo incluir password si no está vacío
      const dataToSend = user && !formData.password
        ? { ...formData, password: undefined } // No enviar password si está vacío al editar
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Error al ${user ? "actualizar" : "crear"} usuario`);
      }

      const userData = await response.json();
      const userId = user ? user._id : userData._id;

      // Si hay una nueva imagen, subirla a Firebase
      if (imageFile && userId) {
        try {
          setIsUploadingImage(true);
          toast({
            title: "Subiendo imagen...",
            description: "Por favor espera mientras se sube la imagen de perfil",
          });

          const imageUrl = await ImageService.saveProfileImage(imageFile, userId);

          // Actualizar el usuario con la nueva URL de la imagen
          await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imagen: imageUrl }),
          });
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast({
            title: "Advertencia",
            description: "El usuario se guardó pero hubo un error al subir la imagen",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      toast({
        title: user ? "Usuario actualizado" : "Usuario creado",
        description: `${formData.firstname} ${formData.lastname} ha sido ${
          user ? "actualizado" : "creado"
        } exitosamente.`,
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `No se pudo ${user ? "actualizar" : "crear"} el usuario`,
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
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Modifica los datos del usuario a continuación."
              : "Completa los datos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Información Básica</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Ej: Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@email.com"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {!user && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={user ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                  required={!user}
                />
                {user && (
                  <p className="text-xs text-muted-foreground">
                    Completa solo si quieres cambiar la contraseña
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">
                  Rol <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.rol} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumno">Alumno</SelectItem>
                    <SelectItem value="profe">Profesor</SelectItem>
                    <SelectItem value="dueño de academia">Dueño de Academia</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telnumber">Teléfono</Label>
              <Input
                id="telnumber"
                name="telnumber"
                value={formData.telnumber}
                onChange={handleInputChange}
                placeholder="Ej: +54 9 381 123-4567"
              />
            </div>
          </div>

          {/* Imagen de Perfil */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Imagen de Perfil</h3>
            <div className="space-y-2">
              <Label htmlFor="imagen">Foto de Perfil</Label>

              {!imagePreview ? (
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("imagen")?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Imagen
                  </Button>
                  <Input
                    id="imagen"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG o WebP (máx. 5MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-8 w-8"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageFile ? (
                    <p className="text-sm text-muted-foreground">
                      Nueva imagen lista para subir
                    </p>
                  ) : existingImageUrl ? (
                    <p className="text-sm text-muted-foreground">
                      Imagen actual (selecciona una nueva para reemplazarla)
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Biografía */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Biografía</h3>
            <div className="space-y-2">
              <Label htmlFor="bio">Descripción</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Información adicional sobre el usuario..."
                rows={3}
              />
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Redes Sociales (Opcional)</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="usuario.facebook"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isUploadingImage}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingImage}>
              {(isLoading || isUploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploadingImage
                ? "Subiendo imagen..."
                : isLoading
                ? user ? "Actualizando..." : "Creando..."
                : user ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
