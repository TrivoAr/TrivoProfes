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
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { ImageService } from "@/services/ImageService";

interface AcademyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academy?: any;
  onSuccess?: () => void;
}

const DISCIPLINAS = ["Running", "Trekking", "Ciclismo", "Otros"];

export function AcademyFormDialog({
  open,
  onOpenChange,
  academy,
  onSuccess,
}: AcademyFormDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre_academia: "",
    pais: "Argentina",
    provincia: "",
    localidad: "",
    descripcion: "",
    tipo_disciplina: "",
    telefono: "",
    clase_gratis: false,
    precio: "",
    cbu: "",
    alias: "",
  });

  // Cargar datos del academia si estamos editando
  useEffect(() => {
    if (academy) {
      setFormData({
        nombre_academia: academy.nombre_academia || "",
        pais: academy.pais || "Argentina",
        provincia: academy.provincia || "",
        localidad: academy.localidad || "",
        descripcion: academy.descripcion || "",
        tipo_disciplina: academy.tipo_disciplina || "",
        telefono: academy.telefono || "",
        clase_gratis: academy.clase_gratis || false,
        precio: academy.precio || "",
        cbu: academy.cbu || "",
        alias: academy.alias || "",
      });

      if (academy.imagen) {
        setImagePreview(academy.imagen);
      }
    } else {
      // Reset form para crear nueva academia
      setFormData({
        nombre_academia: "",
        pais: "Argentina",
        provincia: "",
        localidad: "",
        descripcion: "",
        tipo_disciplina: "",
        telefono: "",
        clase_gratis: false,
        precio: "",
        cbu: "",
        alias: "",
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [academy, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
      if (!formData.nombre_academia.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la academia es requerido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.provincia.trim() || !formData.localidad.trim()) {
        toast({
          title: "Error",
          description: "La provincia y localidad son requeridas",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.tipo_disciplina) {
        toast({
          title: "Error",
          description: "Selecciona un tipo de disciplina",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Preparar datos
      const dataToSend = {
        nombre_academia: formData.nombre_academia,
        pais: formData.pais,
        provincia: formData.provincia,
        localidad: formData.localidad,
        descripcion: formData.descripcion || undefined,
        tipo_disciplina: formData.tipo_disciplina,
        telefono: formData.telefono || undefined,
        clase_gratis: formData.clase_gratis,
        precio: formData.precio || undefined,
        cbu: formData.cbu || undefined,
        alias: formData.alias || undefined,
      };

      // Crear o actualizar academia
      const url = academy
        ? `/api/academias/${academy._id}`
        : "/api/academias";
      const method = academy ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar la academia");
      }

      const savedAcademia = await response.json();

      // Si hay una imagen, subirla
      if (imageFile && savedAcademia._id) {
        try {
          const imageUrl = await ImageService.saveAcademyImage(
            imageFile,
            savedAcademia._id
          );

          // Actualizar la academia con la URL de la imagen
          await fetch(`/api/academias/${savedAcademia._id}`, {
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
              "La academia se guardó pero hubo un error al subir la imagen",
            variant: "destructive",
          });
        }
      }

      toast({
        title: academy ? "Academia actualizada" : "Academia creada",
        description: `La academia "${formData.nombre_academia}" ha sido ${
          academy ? "actualizada" : "creada"
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
        description: error.message || "No se pudo guardar la academia",
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
            {academy ? "Editar Academia" : "Crear Nueva Academia"}
          </DialogTitle>
          <DialogDescription>
            {academy
              ? "Modifica los datos de la academia"
              : "Completa los datos para crear una nueva academia"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="nombre_academia">
                Nombre de la Academia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre_academia"
                name="nombre_academia"
                value={formData.nombre_academia}
                onChange={handleInputChange}
                placeholder="Ej: Running Tucumán"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_disciplina">
                Tipo de Disciplina <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo_disciplina}
                onValueChange={(value) =>
                  handleSelectChange("tipo_disciplina", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS.map((disciplina) => (
                    <SelectItem key={disciplina} value={disciplina}>
                      {disciplina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe la academia, sus instalaciones, metodología, etc."
                rows={4}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  placeholder="Argentina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">
                  Provincia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  placeholder="Ej: Tucumán"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localidad">
                  Localidad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="localidad"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleInputChange}
                  placeholder="Ej: San Miguel de Tucumán"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Pago</h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="clase_gratis"
                checked={formData.clase_gratis}
                onCheckedChange={(checked) =>
                  handleSwitchChange("clase_gratis", checked)
                }
              />
              <Label htmlFor="clase_gratis">Ofrece clase gratis</Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="Ej: 5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cbu">CBU</Label>
                <Input
                  id="cbu"
                  name="cbu"
                  value={formData.cbu}
                  onChange={handleInputChange}
                  placeholder="CBU para transferencias"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alias">Alias</Label>
                <Input
                  id="alias"
                  name="alias"
                  value={formData.alias}
                  onChange={handleInputChange}
                  placeholder="Alias bancario"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: +54 9 381 1234567"
              />
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Imagen</h3>
            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen de la Academia</Label>

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
                : academy
                ? "Actualizar Academia"
                : "Crear Academia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
