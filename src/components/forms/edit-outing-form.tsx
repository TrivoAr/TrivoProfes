"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { ImageService } from "@/services/ImageService";
import Image from "next/image";
import { DIFICULTAD_OPTIONS } from "@/lib/constants/salidas";

// Lazy load componentes pesados (mapas y geolocalización)
const LocationPicker = dynamic(() => import("@/components/map/location-picker").then(mod => ({ default: mod.LocationPicker })), {
  loading: () => <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>,
  ssr: false
});

const AddressAutocomplete = dynamic(() => import("@/components/map/address-autocomplete").then(mod => ({ default: mod.AddressAutocomplete })), {
  loading: () => <div className="h-10 flex items-center justify-center border rounded-md"><Loader2 className="h-4 w-4 animate-spin" /></div>,
  ssr: false
});

interface EditOutingFormProps {
  salidaId: string;
  onSuccess?: () => void;
}

interface Sponsor {
  _id: string;
  name: string;
  imagen?: string;
}

interface SalidaData {
  _id: string;
  nombre: string;
  ubicacion?: string;
  deporte?: string;
  fecha?: string;
  hora?: string;
  duracion?: string;
  descripcion?: string;
  localidad?: string;
  provincia?: string;
  telefonoOrganizador?: string;
  imagen?: string;
  imagenes?: string[];
  locationCoords?: {
    lat?: number;
    lng?: number;
  };
  dificultad?: string;
  precio?: string;
  cupo: number;
  cbu?: string;
  alias?: string;
  whatsappLink?: string;
  sponsor_id?: string;
}

export function EditOutingForm({ salidaId, onSuccess }: EditOutingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Verificar si el usuario es admin
  const isAdmin = session?.user?.rol === "admin";

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    deporte: "",
    fecha: "",
    hora: "",
    duracion: "",
    descripcion: "",
    localidad: "",
    provincia: "",
    telefonoOrganizador: "",
    imagen: "",
    locationCoords: {
      lat: undefined as number | undefined,
      lng: undefined as number | undefined,
    },
    dificultad: "",
    precio: "",
    cupo: "",
    cbu: "",
    alias: "",
    whatsappLink: "",
    sponsor_id: "",
  });

  // Cargar datos de la salida existente
  useEffect(() => {
    const fetchSalida = async () => {
      try {
        const response = await fetch(`/api/salidas/${salidaId}`);

        if (response.status === 401) {
          toast({
            title: "Sesión expirada",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "No se pudo cargar la salida");
        }

        const data: SalidaData = await response.json();

        // Actualizar formData con los datos existentes
        setFormData({
          nombre: data.nombre || "",
          ubicacion: data.ubicacion || "",
          deporte: data.deporte || "",
          fecha: data.fecha || "",
          hora: data.hora || "",
          duracion: data.duracion || "",
          descripcion: data.descripcion || "",
          localidad: data.localidad || "",
          provincia: data.provincia || "",
          // Si la salida no tiene teléfono, usar el del usuario actual
          telefonoOrganizador: data.telefonoOrganizador || session?.user?.telnumber || "",
          imagen: data.imagen || "",
          locationCoords: {
            lat: data.locationCoords?.lat,
            lng: data.locationCoords?.lng,
          },
          dificultad: data.dificultad || "",
          precio: data.precio || "",
          cupo: data.cupo?.toString() || "",
          cbu: data.cbu || "",
          alias: data.alias || "",
          whatsappLink: data.whatsappLink || "",
          sponsor_id: data.sponsor_id || "",
        });

        // Si hay imágenes existentes, cargarlas
        if (data.imagenes && data.imagenes.length > 0) {
          setExistingImages(data.imagenes);
        } else if (data.imagen) {
          // Fallback a imagen legacy
          setExistingImages([data.imagen]);
        }
      } catch (error: any) {
        console.error("Error fetching salida:", error);
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar la salida",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSalida();
  }, [salidaId, toast, router]);

  // Cargar sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("/api/sponsors");
        const data = await response.json();
        if (data.success) {
          setSponsors(data.sponsors);
        }
      } catch (error) {
        console.error("Error loading sponsors:", error);
        toast({
          title: "Advertencia",
          description: "No se pudieron cargar los sponsors",
          variant: "destructive",
        });
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchSponsors();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si se selecciona un deporte, actualizar el precio y el link de WhatsApp según la configuración
    if (name === "deporte" && value) {
      try {
        // Obtener configuración de pagos
        const configResponse = await fetch("/api/configuracion-pagos");
        if (configResponse.ok) {
          const configData = await configResponse.json();
          const precioDeporte =
            configData.preciosPorDeporte?.[value as keyof typeof configData.preciosPorDeporte];

          if (precioDeporte) {
            setFormData((prev) => ({ ...prev, precio: precioDeporte }));
          } else if (configData.precioPorDefecto) {
            setFormData((prev) => ({ ...prev, precio: configData.precioPorDefecto }));
          }
        }

        // Obtener configuración de WhatsApp
        const whatsappResponse = await fetch("/api/configuracion-whatsapp");
        if (whatsappResponse.ok) {
          const whatsappData = await whatsappResponse.json();
          const grupoWhatsApp =
            whatsappData.gruposPorDeporte?.[value as keyof typeof whatsappData.gruposPorDeporte];

          if (grupoWhatsApp) {
            setFormData((prev) => ({ ...prev, whatsappLink: grupoWhatsApp }));
          }
        }
      } catch (error) {
        console.error("Error updating configurations:", error);
      }
    }
  };

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address?: string;
    provincia?: string;
    localidad?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      locationCoords: {
        lat: location.lat,
        lng: location.lng,
      },
      ubicacion: location.address || prev.ubicacion,
      provincia: location.provincia || prev.provincia,
      localidad: location.localidad || prev.localidad,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar máximo de 10 imágenes (incluyendo existentes)
    const totalImages = existingImages.length + imageFiles.length + files.length;
    if (totalImages > 10) {
      toast({
        title: "Error",
        description: "Máximo 10 imágenes permitidas en total",
        variant: "destructive",
      });
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];

    files.forEach((file) => {
      const validation = ImageService.validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: "Error",
          description: `${file.name}: ${validation.error}`,
          variant: "destructive",
        });
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Crear previews para los archivos válidos
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Guardar los archivos
    setImageFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la salida es requerido",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.cupo || parseInt(formData.cupo) <= 0) {
        toast({
          title: "Error",
          description: "El cupo debe ser mayor a 0",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Preparar datos para actualizar
      const updateData = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion || undefined,
        deporte: formData.deporte || undefined,
        fecha: formData.fecha || undefined,
        hora: formData.hora || undefined,
        duracion: formData.duracion || undefined,
        descripcion: formData.descripcion || undefined,
        localidad: formData.localidad || undefined,
        provincia: formData.provincia || undefined,
        telefonoOrganizador: formData.telefonoOrganizador || undefined,
        locationCoords:
          formData.locationCoords.lat && formData.locationCoords.lng
            ? {
                lat: formData.locationCoords.lat,
                lng: formData.locationCoords.lng,
              }
            : undefined,
        dificultad: formData.dificultad || undefined,
        precio: formData.precio || undefined,
        cupo: parseInt(formData.cupo),
        cbu: formData.cbu || undefined,
        alias: formData.alias || undefined,
        whatsappLink: formData.whatsappLink || undefined,
        sponsor_id: formData.sponsor_id || undefined,
      };

      // Actualizar la salida
      const response = await fetch(`/api/salidas/${salidaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la salida");
      }

      // Si hay nuevas imágenes para subir o se modificaron las existentes
      if (imageFiles.length > 0 || existingImages.length > 0) {
        try {
          setIsUploadingImage(true);

          let newImageUrls: string[] = [];

          // Subir nuevas imágenes si las hay
          if (imageFiles.length > 0) {
            toast({
              title: "Subiendo imágenes...",
              description: `Por favor espera mientras se suben ${imageFiles.length} imagen(es)`,
            });
            newImageUrls = await ImageService.saveSocialImages(imageFiles, salidaId);
            console.log("✅ Imágenes subidas a Firebase:", newImageUrls);
          }

          // Combinar imágenes existentes con las nuevas
          const allImageUrls = [...existingImages, ...newImageUrls];
          console.log("📸 Total de URLs a guardar:", allImageUrls);

          // Actualizar la salida con todas las URLs de imágenes
          const response = await fetch(`/api/salidas/${salidaId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imagenes: allImageUrls }),
          });

          const result = await response.json();
          console.log("💾 Respuesta del servidor:", result);
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          toast({
            title: "Advertencia",
            description:
              "La salida se actualizó pero hubo un error al subir las imágenes",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      toast({
        title: "¡Salida actualizada!",
        description: `La salida "${formData.nombre}" ha sido actualizada exitosamente.`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirigir a la página de detalles de la salida actualizada
        router.push(`/outings/${salidaId}`);
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la salida",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando datos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información Básica</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre de la Salida <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Trekking en las Sierras"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deporte">Deporte/Actividad</Label>
            <Select
              value={formData.deporte}
              onValueChange={(value) => handleSelectChange("deporte", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un deporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Trekking">Trekking</SelectItem>
                <SelectItem value="Ciclismo">Ciclismo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Describe la actividad, nivel requerido, qué llevar, etc."
            rows={4}
          />
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fecha y Hora</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input
              id="hora"
              name="hora"
              type="time"
              value={formData.hora}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion">Duración</Label>
            <Input
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={handleInputChange}
              placeholder="Ej: 2 horas, 3-4 horas"
            />
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ubicación</h3>

        {/* Autocomplete de dirección */}
        <AddressAutocomplete
          value={formData.ubicacion}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, ubicacion: value }))
          }
          onLocationSelect={(location) => {
            setFormData((prev) => ({
              ...prev,
              ubicacion: location.address,
              locationCoords: {
                lat: location.lat,
                lng: location.lng,
              },
            }));
          }}
        />

        {/* Mapa con selectores de Provincia y Localidad integrados */}
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={
            formData.locationCoords.lat && formData.locationCoords.lng
              ? {
                  lat: formData.locationCoords.lat,
                  lng: formData.locationCoords.lng,
                }
              : undefined
          }
          initialProvincia={formData.provincia}
          initialLocalidad={formData.localidad}
        />
      </div>

      {/* Detalles de la Actividad */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detalles de la Actividad</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dificultad">Dificultad</Label>
            <Select
              value={formData.dificultad}
              onValueChange={(value) => handleSelectChange("dificultad", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la dificultad" />
              </SelectTrigger>
              <SelectContent>
                {DIFICULTAD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cupo">
              Cupo Máximo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cupo"
              name="cupo"
              type="number"
              min="1"
              value={formData.cupo}
              onChange={handleInputChange}
              placeholder="Ej: 20"
              required
            />
          </div>
        </div>
      </div>

      {/* Información de Pago */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información de Pago (Opcional)</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              placeholder="Ej: $5000 o Gratis"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telefonoOrganizador">Teléfono</Label>
            <Input
              id="telefonoOrganizador"
              name="telefonoOrganizador"
              value={formData.telefonoOrganizador}
              onChange={handleInputChange}
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappLink">Grupo de WhatsApp</Label>
            <Input
              id="whatsappLink"
              name="whatsappLink"
              value={formData.whatsappLink}
              onChange={handleInputChange}
              placeholder="Se asignará automáticamente según el deporte"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Asignado automáticamente según el deporte seleccionado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sponsor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sponsor (Opcional)</h3>
        <div className="space-y-2">
          <Label htmlFor="sponsor">Seleccionar Sponsor</Label>
          <Select
            value={formData.sponsor_id || "none"}
            onValueChange={(value) =>
              handleSelectChange("sponsor_id", value === "none" ? "" : value)
            }
            disabled={loadingSponsors}
          >
            <SelectTrigger id="sponsor">
              <SelectValue
                placeholder={
                  loadingSponsors
                    ? "Cargando sponsors..."
                    : sponsors.length === 0
                    ? "No hay sponsors disponibles"
                    : "Selecciona un sponsor"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin sponsor</SelectItem>
              {sponsors.map((sponsor) => (
                <SelectItem key={sponsor._id} value={sponsor._id}>
                  {sponsor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Elige un sponsor para esta salida si corresponde
          </p>
        </div>
      </div>

      {/* Imágenes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imágenes</h3>
        <div className="space-y-2">
          <Label htmlFor="imagen">Imágenes de la Salida</Label>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("imagen")?.click()}
              disabled={isLoading || (existingImages.length + imageFiles.length >= 10)}
            >
              <Upload className="mr-2 h-4 w-4" />
              {existingImages.length > 0 || imageFiles.length > 0 ? "Agregar más imágenes" : "Seleccionar Imágenes"}
            </Button>
            <Input
              id="imagen"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              multiple
            />
            <p className="text-sm text-muted-foreground">
              JPG, PNG o WebP (máx. 5MB cada una, hasta 10 imágenes)
            </p>
          </div>

          {/* Imágenes existentes */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Imágenes actuales:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={imageUrl}
                      alt={`Imagen existente ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleRemoveExistingImage(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes para subir */}
          {imagePreviews.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Nuevas imágenes para subir:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-video rounded-lg overflow-hidden border border-green-500">
                    <Image
                      src={preview}
                      alt={`Nueva imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleRemoveNewImage(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Nueva
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <p className="text-sm text-muted-foreground">
              Total: {existingImages.length + imagePreviews.length} imagen(es). La primera será la imagen principal.
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading || isUploadingImage}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || isUploadingImage}>
          {(isLoading || isUploadingImage) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isUploadingImage
            ? "Subiendo imagen..."
            : isLoading
            ? "Actualizando..."
            : "Actualizar Salida"}
        </Button>
      </div>
    </form>
  );
}
