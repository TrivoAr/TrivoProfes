"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Mountain, Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClubConfig {
  precioMensual: number;
  maxPrecioSalida: number;
  limiteSemanal: number;
  radioCheckIn: number;
  deportePermitido: string;
  active: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export function ClubTrekkingConfigComponent() {
  const [config, setConfig] = useState<ClubConfig>({
    precioMensual: 25000,
    maxPrecioSalida: 10000,
    limiteSemanal: 2,
    radioCheckIn: 100,
    deportePermitido: "Trekking",
    active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar configuración actual
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/config/club-trekking");
      if (!response.ok) {
        throw new Error("Error al cargar la configuración");
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error loading config:", err);
      setError("No se pudo cargar la configuración del Club");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/config/club-trekking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la configuración");
      }

      const data = await response.json();
      setConfig(data.config);
      setSuccess("Configuración guardada correctamente");

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error saving config:", err);
      setError(err.message || "Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ClubConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mountain className="h-5 w-5" />
          <div>
            <CardTitle>Configuración del Club del Trekking</CardTitle>
            <CardDescription>
              Administra los precios, límites y configuraciones del Club
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mensajes de error y éxito */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Estado del Club */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="active" className="text-base font-medium">
              Club Activo
            </Label>
            <p className="text-sm text-muted-foreground">
              {config.active
                ? "El Club está habilitado para nuevas suscripciones"
                : "El Club está deshabilitado temporalmente"}
            </p>
          </div>
          <Switch
            id="active"
            checked={config.active}
            onCheckedChange={(checked) => handleChange("active", checked)}
          />
        </div>

        {/* Configuraciones de precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precioMensual">Precio Mensual (ARS)</Label>
            <Input
              id="precioMensual"
              type="number"
              min="0"
              step="100"
              value={config.precioMensual}
              onChange={(e) =>
                handleChange("precioMensual", Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Precio de la suscripción mensual al Club
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrecioSalida">Precio Máximo Salida (ARS)</Label>
            <Input
              id="maxPrecioSalida"
              type="number"
              min="0"
              step="100"
              value={config.maxPrecioSalida}
              onChange={(e) =>
                handleChange("maxPrecioSalida", Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Precio máximo de salida incluido en la suscripción
            </p>
          </div>
        </div>

        {/* Límites y restricciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limiteSemanal">Límite Semanal</Label>
            <Input
              id="limiteSemanal"
              type="number"
              min="1"
              max="7"
              value={config.limiteSemanal}
              onChange={(e) =>
                handleChange("limiteSemanal", Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Máximo de salidas por semana (1-7)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radioCheckIn">Radio Check-In (metros)</Label>
            <Input
              id="radioCheckIn"
              type="number"
              min="10"
              max="1000"
              step="10"
              value={config.radioCheckIn}
              onChange={(e) =>
                handleChange("radioCheckIn", Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Distancia máxima para hacer check-in (10-1000m)
            </p>
          </div>
        </div>

        {/* Deporte permitido */}
        <div className="space-y-2">
          <Label htmlFor="deportePermitido">Deporte Permitido</Label>
          <Input
            id="deportePermitido"
            type="text"
            value={config.deportePermitido}
            onChange={(e) => handleChange("deportePermitido", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Tipo de deporte asociado al Club del Trekking
          </p>
        </div>

        {/* Información de última actualización */}
        {config.updatedAt && (
          <div className="pt-4 border-t text-xs text-muted-foreground">
            Última actualización:{" "}
            {new Date(config.updatedAt).toLocaleString("es-AR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
