"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Provincia {
  id: string;
  nombre: string;
  centroide: {
    lat: number;
    lon: number;
  };
}

interface Localidad {
  id: string;
  nombre: string;
  centroide: {
    lat: number;
    lon: number;
  };
  provincia: {
    id: string;
    nombre: string;
  };
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address?: string;
    provincia?: string;
    localidad?: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
  initialProvincia?: string;
  initialLocalidad?: string;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  initialProvincia,
  initialLocalidad,
}: LocationPickerProps) {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Coordenadas de San Miguel de Tucumán
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.lat || -26.8083,
    longitude: initialLocation?.lng || -65.2176,
    zoom: 12,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>("");
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const mapRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar provincias al montar el componente
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await fetch(
          "https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre,centroide&max=24"
        );
        const data = await response.json();
        setProvincias(data.provincias);
      } catch (error) {
        console.error("Error cargando provincias:", error);
      }
    };

    fetchProvincias();
  }, []);

  // Inicializar provincia y localidad cuando se cargan las provincias y hay valores iniciales
  useEffect(() => {
    if (provincias.length > 0 && initialProvincia && !isInitialized) {
      // Buscar la provincia por nombre
      const provincia = provincias.find(
        (p) => p.nombre.toLowerCase() === initialProvincia.toLowerCase()
      );

      if (provincia) {
        setSelectedProvincia(provincia.id);
        setIsInitialized(true);
      }
    }
  }, [provincias, initialProvincia, isInitialized]);

  // Inicializar localidad cuando se cargan las localidades y hay valor inicial
  useEffect(() => {
    if (localidades.length > 0 && initialLocalidad && isInitialized) {
      // Buscar la localidad por nombre
      const localidad = localidades.find(
        (l) => l.nombre.toLowerCase() === initialLocalidad.toLowerCase()
      );

      if (localidad) {
        setSelectedLocalidad(localidad.id);
      }
    }
  }, [localidades, initialLocalidad, isInitialized]);

  // Cargar localidades cuando se selecciona una provincia
  useEffect(() => {
    if (!selectedProvincia) {
      setLocalidades([]);
      return;
    }

    const fetchLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        const response = await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=${selectedProvincia}&campos=id,nombre,centroide,provincia&max=1000`
        );
        const data = await response.json();
        setLocalidades(data.localidades);
      } catch (error) {
        console.error("Error cargando localidades:", error);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    fetchLocalidades();
  }, [selectedProvincia]);

  // Manejar selección de provincia
  const handleProvinciaChange = (provinciaId: string) => {
    setSelectedProvincia(provinciaId);
    setSelectedLocalidad("");

    // Centrar mapa en la provincia seleccionada
    const provincia = provincias.find((p) => p.id === provinciaId);
    if (provincia && mapRef.current) {
      mapRef.current.flyTo({
        center: [provincia.centroide.lon, provincia.centroide.lat],
        zoom: 8,
        duration: 2000,
      });
    }
  };

  // Manejar selección de localidad
  const handleLocalidadChange = (localidadId: string) => {
    setSelectedLocalidad(localidadId);

    const localidad = localidades.find((l) => l.id === localidadId);
    if (localidad) {
      const { lat, lon } = localidad.centroide;

      // Actualizar viewport y marker
      setViewport({
        latitude: lat,
        longitude: lon,
        zoom: 14,
      });
      setMarker({ lat, lng: lon });

      // Notificar la selección con provincia y localidad
      // NO sobrescribimos el address si ya existe uno del mapa
      onLocationSelect({
        lat,
        lng: lon,
        provincia: localidad.provincia.nombre,
        localidad: localidad.nombre,
      });

      // Animar el mapa a la nueva ubicación
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lon, lat],
          zoom: 14,
          duration: 2000,
        });
      }
    }
  };

  const handleMapClick = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat;
      setMarker({ lat, lng });
      onLocationSelect({ lat, lng });

      // Reverse geocoding para obtener la dirección
      if (MAPBOX_TOKEN) {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name;
              onLocationSelect({ lat, lng, address });
            }
          })
          .catch((err) => console.error("Error en reverse geocoding:", err));
      }
    },
    [onLocationSelect, MAPBOX_TOKEN]
  );

  return (
    <div className="space-y-4">
      {/* Selección de Provincia y Localidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provincia">Provincia</Label>
          <Select value={selectedProvincia} onValueChange={handleProvinciaChange}>
            <SelectTrigger id="provincia" className="mt-2">
              <SelectValue placeholder="Selecciona una provincia" />
            </SelectTrigger>
            <SelectContent>
              {provincias.map((provincia) => (
                <SelectItem key={provincia.id} value={provincia.id}>
                  {provincia.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="localidad">Localidad</Label>
          <Select
            value={selectedLocalidad}
            onValueChange={handleLocalidadChange}
            disabled={!selectedProvincia || loadingLocalidades}
          >
            <SelectTrigger id="localidad" className="mt-2">
              <SelectValue
                placeholder={
                  loadingLocalidades
                    ? "Cargando localidades..."
                    : selectedProvincia
                    ? "Selecciona una localidad"
                    : "Primero selecciona una provincia"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {localidades.map((localidad) => (
                <SelectItem key={localidad.id} value={localidad.id}>
                  {localidad.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecciona una provincia y localidad, o haz clic en el mapa para elegir una ubicación precisa
      </p>

      {!MAPBOX_TOKEN ? (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-sm font-medium text-destructive">Error de configuración</p>
            <p className="text-xs text-muted-foreground mt-1">
              La variable NEXT_PUBLIC_MAPBOX_TOKEN no está configurada
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
          <Map
            ref={mapRef}
            {...viewport}
            onMove={(evt: any) => setViewport(evt.viewState)}
            onClick={handleMapClick}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            {marker && (
              <Marker latitude={marker.lat} longitude={marker.lng}>
                <div className="relative">
                  <MapPin className="w-8 h-8 text-red-500 fill-red-500 animate-bounce" />
                </div>
              </Marker>
            )}
          </Map>
        </div>
      )}

      {marker && (
        <div className="text-sm text-muted-foreground">
          <strong>Coordenadas seleccionadas:</strong>
          <br />
          Latitud: {marker.lat.toFixed(6)}, Longitud: {marker.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
