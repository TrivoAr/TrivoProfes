"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { LocationPicker } from "@/components/map/location-picker";
import { AddressAutocomplete } from "@/components/map/address-autocomplete";
import { Loader2, Upload, X } from "lucide-react";
import { ImageService } from "@/services/ImageService";
import Image from "next/image";
import { DIFICULTAD_OPTIONS } from "@/lib/constants/salidas";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // Cargar sponsors y configuración de pagos al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar sponsors
        const sponsorsResponse = await fetch("/api/sponsors");
        const sponsorsData = await sponsorsResponse.json();
        if (sponsorsData.success) {
          setSponsors(sponsorsData.sponsors);
        }

        // Cargar configuración de pagos
        const configResponse = await fetch("/api/configuracion-pagos");
        if (configResponse.ok) {
          const configData = await configResponse.json();

          // Establecer CBU y Alias por defecto
          setFormData((prev) => ({
            ...prev,
            cbu: configData.cbuPorDefecto || "",
            alias: configData.aliasPorDefecto || "",
            precio: configData.precioPorDefecto || "",
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
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si se selecciona un deporte, actualizar el precio según la configuración
    if (name === "deporte" && value) {
      try {
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
      } catch (error) {
        console.error("Error updating price:", error);
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
    setFormData((prev) => ({ ...prev, imagen: "" }));
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

      // Si hay una imagen, subirla a Firebase
      let imageUrl = "";
      if (imageFile && salidaId) {
        try {
          setIsUploadingImage(true);
          toast({
            title: "Subiendo imagen...",
            description: "Por favor espera mientras se sube la imagen",
          });

          imageUrl = await ImageService.saveSocialImage(imageFile, salidaId);

          // Actualizar la salida con la URL de la imagen
          await fetch(`/api/salidas/${salidaId}`, {
            method: "PATCH",
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
              "La salida se creó pero hubo un error al subir la imagen",
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
      setImageFile(null);
      setImagePreview(null);

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
            <Label htmlFor="whatsappLink">Link de WhatsApp</Label>
            <Input
              id="whatsappLink"
              name="whatsappLink"
              value={formData.whatsappLink}
              onChange={handleInputChange}
              placeholder="https://wa.me/5491112345678"
            />
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

      {/* Imagen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagen (Opcional)</h3>
        <div className="space-y-2">
          <Label htmlFor="imagen">Imagen de la Salida</Label>

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
              <p className="text-sm text-muted-foreground">
                Imagen lista para subir
              </p>
            </div>
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
