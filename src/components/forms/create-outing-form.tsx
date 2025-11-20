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
const LocationPicker = dynamic(
  () =>
    import("@/components/map/location-picker").then((mod) => ({
      default: mod.LocationPicker,
    })),
  {
    loading: () => (
      <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const AddressAutocomplete = dynamic(
  () =>
    import("@/components/map/address-autocomplete").then((mod) => ({
      default: mod.AddressAutocomplete,
    })),
  {
    loading: () => (
      <div className="h-10 flex items-center justify-center border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

interface CreateOutingFormProps {
  onSuccess?: () => void;
}

interface Sponsor {
  _id: string;
  name: string;
  imagen?: string;
}

export function CreateOutingForm({ onSuccess }: CreateOutingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);

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

  // Cargar sponsors, configuración de pagos y WhatsApp al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar todos los datos en paralelo para mejorar performance
        const [sponsorsResponse, configResponse] = await Promise.all([
          fetch("/api/sponsors"),
          fetch("/api/configuracion-pagos"),
        ]);

        // Procesar sponsors
        if (sponsorsResponse.ok) {
          const sponsorsData = await sponsorsResponse.json();
          if (sponsorsData.success) {
            setSponsors(sponsorsData.sponsors);
          }
        }

        // Procesar configuración de pagos
        if (configResponse.ok) {
          const configData = await configResponse.json();

          // Establecer CBU, Alias y Precio por defecto
          setFormData((prev) => ({
            ...prev,
            cbu: configData.cbuPorDefecto || "",
            alias: configData.aliasPorDefecto || "",
            precio: configData.precioPorDefecto || "",
            telefonoOrganizador: session?.user?.telnumber || prev.telefonoOrganizador,
          }));
        } else if (session?.user?.telnumber) {
          // Si falla config pero tenemos teléfono, establecerlo
          setFormData((prev) => ({
            ...prev,
            telefonoOrganizador: session.user.telnumber || "",
          }));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Advertencia",
          description: "No se pudieron cargar algunos datos iniciales",
          variant: "destructive",
        });
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchInitialData();
  }, [toast, session]);

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
      // Solo actualizar ubicacion si viene un nuevo address en location
      ubicacion: location.address !== undefined ? location.address : prev.ubicacion,
      // Siempre actualizar provincia y localidad si vienen
      provincia: location.provincia || prev.provincia,
      localidad: location.localidad || prev.localidad,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar máximo de 10 imágenes
    if (imageFiles.length + files.length > 10) {
      toast({
        title: "Error",
        description: "Máximo 10 imágenes permitidas",
        variant: "destructive",
      });
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    const previews: string[] = [];

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

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

      // Primero crear la salida para obtener el ID
      const tempData = {
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
        imagen: undefined, // Se actualizará después
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

      const response = await fetch("/api/salidas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tempData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la salida");
      }

      const result = await response.json();
      const salidaId = result._id;

      // Si hay imágenes, subirlas a Firebase
      let imageUrls: string[] = [];
      if (imageFiles.length > 0 && salidaId) {
        try {
          setIsUploadingImage(true);
          toast({
            title: "Subiendo imágenes...",
            description: `Por favor espera mientras se suben ${imageFiles.length} imagen(es)`,
          });

          imageUrls = await ImageService.saveSocialImages(imageFiles, salidaId);

          // Actualizar la salida con las URLs de las imágenes
          await fetch(`/api/salidas/${salidaId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imagenes: imageUrls }),
          });
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          toast({
            title: "Advertencia",
            description:
              "La salida se creó pero hubo un error al subir las imágenes",
            variant: "destructive",
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      toast({
        title: "¡Salida creada!",
        description: `La salida "${formData.nombre}" ha sido creada exitosamente.`,
      });

      // Reset form
      setFormData({
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
        locationCoords: { lat: undefined, lng: undefined },
        dificultad: "",
        precio: "",
        cupo: "",
        cbu: "",
        alias: "",
        whatsappLink: "",
        sponsor_id: "",
      });
      setImageFiles([]);
      setImagePreviews([]);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/outings");
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la salida",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              locationCoords: { lat: location.lat, lng: location.lng },
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
        <h3 className="text-lg font-semibold">Información de Pago</h3>
        {!isAdmin && (
          <p className="text-sm text-muted-foreground">
            Los valores de precio, CBU y alias son establecidos por el administrador y no pueden ser modificados.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              placeholder="Ej: $5000 o Gratis"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Establecido por el administrador
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cbu">CBU</Label>
            <Input
              id="cbu"
              name="cbu"
              value={formData.cbu}
              onChange={handleInputChange}
              placeholder="CBU para transferencias"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Establecido por el administrador
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              name="alias"
              value={formData.alias}
              onChange={handleInputChange}
              placeholder="Alias bancario"
              readOnly={!isAdmin}
              disabled={!isAdmin}
              className={!isAdmin ? "bg-muted cursor-not-allowed" : ""}
            />
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Establecido por el administrador
              </p>
            )}
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
        <h3 className="text-lg font-semibold">Imágenes (Opcional)</h3>
        <div className="space-y-2">
          <Label htmlFor="imagen">Imágenes de la Salida</Label>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("imagen")?.click()}
              disabled={isLoading || imageFiles.length >= 10}
            >
              <Upload className="mr-2 h-4 w-4" />
              {imageFiles.length > 0 ? "Agregar más imágenes" : "Seleccionar Imágenes"}
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

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => handleRemoveImage(index)}
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
          )}

          {imagePreviews.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {imagePreviews.length} imagen(es) lista(s) para subir. La primera será la imagen principal.
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
            ? "Creando..."
            : "Crear Salida Social"}
        </Button>
      </div>
    </form>
  );
}
