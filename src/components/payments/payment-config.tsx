"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ConfiguracionPagos {
  precioPorDefecto?: string;
  cbuPorDefecto?: string;
  aliasPorDefecto?: string;
  preciosPorDeporte?: {
    Running?: string;
    Trekking?: string;
    Ciclismo?: string;
    Otros?: string;
  };
  permitirPagosGratis: boolean;
}

export function PaymentConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracionPagos>({
    precioPorDefecto: "",
    cbuPorDefecto: "",
    aliasPorDefecto: "",
    preciosPorDeporte: {
      Running: "",
      Trekking: "",
      Ciclismo: "",
      Otros: "",
    },
    permitirPagosGratis: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/configuracion-pagos");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/configuracion-pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Error al guardar configuración");
      }

      toast({
        title: "Configuración guardada",
        description: "Los cambios se aplicarán a las nuevas salidas que se creen",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 flex-shrink-0" />
          <CardTitle className="text-lg sm:text-xl">Configuración de Pagos por Defecto</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Establece los valores predeterminados para CBU, Alias y precios. Estos valores se aplicarán automáticamente al crear nuevas salidas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información de pago general */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Información de Pago General</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cbu">CBU por Defecto</Label>
              <Input
                id="cbu"
                value={config.cbuPorDefecto || ""}
                onChange={(e) =>
                  setConfig({ ...config, cbuPorDefecto: e.target.value })
                }
                placeholder="0000003100010000000000"
              />
              <p className="text-xs text-muted-foreground">
                Este CBU se usará en todas las salidas nuevas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Alias por Defecto</Label>
              <Input
                id="alias"
                value={config.aliasPorDefecto || ""}
                onChange={(e) =>
                  setConfig({ ...config, aliasPorDefecto: e.target.value })
                }
                placeholder="trivo.pagos"
              />
              <p className="text-xs text-muted-foreground">
                Este alias se usará en todas las salidas nuevas
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Precio por defecto */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Precio General por Defecto</h3>
          <div className="space-y-2">
            <Label htmlFor="precioDefecto">Precio por Defecto</Label>
            <Input
              id="precioDefecto"
              value={config.precioPorDefecto || ""}
              onChange={(e) =>
                setConfig({ ...config, precioPorDefecto: e.target.value })
              }
              placeholder="$5000"
            />
            <p className="text-xs text-muted-foreground">
              Este precio se aplicará si no hay un precio específico por deporte
            </p>
          </div>
        </div>

        <Separator />

        {/* Precios por deporte */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Precios Específicos por Deporte</h3>
          <p className="text-sm text-muted-foreground">
            Define precios específicos para cada tipo de actividad. Si está vacío, se usará el precio por defecto.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="precioRunning">Running</Label>
              <Input
                id="precioRunning"
                value={config.preciosPorDeporte?.Running || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    preciosPorDeporte: {
                      ...config.preciosPorDeporte,
                      Running: e.target.value,
                    },
                  })
                }
                placeholder="$4000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioTrekking">Trekking</Label>
              <Input
                id="precioTrekking"
                value={config.preciosPorDeporte?.Trekking || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    preciosPorDeporte: {
                      ...config.preciosPorDeporte,
                      Trekking: e.target.value,
                    },
                  })
                }
                placeholder="$6000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioCiclismo">Ciclismo</Label>
              <Input
                id="precioCiclismo"
                value={config.preciosPorDeporte?.Ciclismo || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    preciosPorDeporte: {
                      ...config.preciosPorDeporte,
                      Ciclismo: e.target.value,
                    },
                  })
                }
                placeholder="$5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioOtros">Otros</Label>
              <Input
                id="precioOtros"
                value={config.preciosPorDeporte?.Otros || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    preciosPorDeporte: {
                      ...config.preciosPorDeporte,
                      Otros: e.target.value,
                    },
                  })
                }
                placeholder="$5000"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Botón guardar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
