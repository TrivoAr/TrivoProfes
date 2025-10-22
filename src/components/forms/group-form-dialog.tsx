"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { ImageService } from "@/services/ImageService";
import { Checkbox } from "@/components/ui/checkbox";

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academiaId: string;
  group?: any;
  onSuccess?: () => void;
}

const DIAS_SEMANA = [
  { value: "Lun", label: "Lunes" },
  { value: "Mar", label: "Martes" },
  { value: "Mie", label: "Miércoles" },
  { value: "Jue", label: "Jueves" },
  { value: "Vie", label: "Viernes" },
  { value: "Sab", label: "Sábado" },
  { value: "Dom", label: "Domingo" },
];

export function GroupFormDialog({
  open,
  onOpenChange,
  academiaId,
  group,
  onSuccess,
}: GroupFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_grupo: "",
    nivel: "",
    ubicacion: "",
    horario: "",
    dias: [] as string[],
    descripcion: "",
    tipo_grupo: "",
    tiempo_promedio: "",
  });

  // Cargar datos del grupo si estamos editando
  useEffect(() => {
    if (group) {
      setFormData({
        nombre_grupo: group.nombre_grupo || "",
        nivel: group.nivel || "",
        ubicacion: group.ubicacion || "",
        horario: group.horario || "",
        dias: group.dias || [],
        descripcion: group.descripcion || "",
        tipo_grupo: group.tipo_grupo || "",
        tiempo_promedio: group.tiempo_promedio || "",
      });

      if (group.imagen) {
        setImagePreview(group.imagen);
      }
    } else {
      // Reset form para crear nuevo grupo
      setFormData({
        nombre_grupo: "",
        nivel: "",
        ubicacion: "",
        horario: "",
        dias: [],
        descripcion: "",
        tipo_grupo: "",
        tiempo_promedio: "",
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [group, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiaToggle = (dia: string) => {
    setFormData((prev) => {
      const dias = prev.dias.includes(dia)
        ? prev.dias.filter((d) => d !== dia)
        : [...prev.dias, dia];
      return { ...prev, dias };
    });
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.nombre_grupo.trim()) {
        toast({
          title: "Error",
          description: "El nombre del grupo es requerido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.dias.length === 0) {
        toast({
          title: "Error",
          description: "Selecciona al menos un día de la semana",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Preparar datos
      const dataToSend = {
        academia_id: academiaId,
        nombre_grupo: formData.nombre_grupo,
        nivel: formData.nivel || undefined,
        ubicacion: formData.ubicacion || undefined,
        horario: formData.horario || undefined,
        dias: formData.dias,
        descripcion: formData.descripcion || undefined,
        tipo_grupo: formData.tipo_grupo || undefined,
        tiempo_promedio: formData.tiempo_promedio || undefined,
      };

      // Crear o actualizar grupo
      const url = group ? `/api/grupos/${group._id}` : "/api/grupos";
      const method = group ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar el grupo");
      }

      const savedGrupo = await response.json();

      // Si hay una imagen, subirla
      if (imageFile && savedGrupo._id) {
        try {
          const imageUrl = await ImageService.saveGroupImage(
            imageFile,
            savedGrupo._id
          );

          // Actualizar el grupo con la URL de la imagen
          await fetch(`/api/grupos/${savedGrupo._id}`, {
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
            description:
              "El grupo se guardó pero hubo un error al subir la imagen",
            variant: "destructive",
          });
        }
      }

      toast({
        title: group ? "Grupo actualizado" : "Grupo creado",
        description: `El grupo "${formData.nombre_grupo}" ha sido ${
          group ? "actualizado" : "creado"
        } exitosamente.`,
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
        description: error.message || "No se pudo guardar el grupo",
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
            {group ? "Editar Grupo" : "Crear Nuevo Grupo"}
          </DialogTitle>
          <DialogDescription>
            {group
              ? "Modifica los datos del grupo"
              : "Completa los datos para crear un nuevo grupo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="nombre_grupo">
                Nombre del Grupo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre_grupo"
                name="nombre_grupo"
                value={formData.nombre_grupo}
                onChange={handleInputChange}
                placeholder="Ej: Grupo Avanzado - Lunes"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel</Label>
                <Input
                  id="nivel"
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                  placeholder="Ej: Principiante, Intermedio, Avanzado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_grupo">Tipo de Grupo</Label>
                <Input
                  id="tipo_grupo"
                  name="tipo_grupo"
                  value={formData.tipo_grupo}
                  onChange={handleInputChange}
                  placeholder="Ej: Competición, Recreativo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe el grupo, objetivos, requisitos, etc."
                rows={4}
              />
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Horarios</h3>

            <div className="space-y-2">
              <Label>Días de la semana <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={dia.value}
                      checked={formData.dias.includes(dia.value)}
                      onCheckedChange={() => handleDiaToggle(dia.value)}
                    />
                    <Label
                      htmlFor={dia.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {dia.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horario">Horario</Label>
                <Input
                  id="horario"
                  name="horario"
                  value={formData.horario}
                  onChange={handleInputChange}
                  placeholder="Ej: 18:00 - 19:30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiempo_promedio">Tiempo Promedio</Label>
                <Input
                  id="tiempo_promedio"
                  name="tiempo_promedio"
                  value={formData.tiempo_promedio}
                  onChange={handleInputChange}
                  placeholder="Ej: 1h 30min"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Punto de Encuentro</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ej: Plaza Independencia"
              />
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Imagen</h3>
            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del Grupo</Label>

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
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
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
                      className="absolute top-2 right-2"
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
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Imagen actual (selecciona una nueva para reemplazarla)
                    </p>
                  )}
                </div>
              )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? "Guardando..."
                : group
                ? "Actualizar Grupo"
                : "Crear Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
