"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GruposPorDeporte {
  Running?: string;
  Trekking?: string;
  Ciclismo?: string;
  Otros?: string;
}

interface ConfiguracionWhatsApp {
  _id?: string;
  gruposPorDeporte?: GruposPorDeporte;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function WhatsAppConfig() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracionWhatsApp>({
    gruposPorDeporte: {
      Running: "",
      Trekking: "",
      Ciclismo: "",
      Otros: "",
    },
  });

  // Verificar si el usuario es admin
  const isAdmin = session?.user?.rol === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchConfig();
    }
  }, [isAdmin]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/configuracion-whatsapp");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/configuracion-whatsapp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gruposPorDeporte: config.gruposPorDeporte,
        }),
      });

      if (response.ok) {
        toast({
          title: "Configuración guardada",
          description: "Los enlaces de WhatsApp han sido actualizados correctamente",
        });
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (deporte: keyof GruposPorDeporte, value: string) => {
    setConfig((prev) => ({
      ...prev,
      gruposPorDeporte: {
        ...prev.gruposPorDeporte,
        [deporte]: value,
      },
    }));
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Grupos de WhatsApp</CardTitle>
          <CardDescription>
            Solo los administradores pueden gestionar los enlaces de WhatsApp
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Grupos de WhatsApp</CardTitle>
        <CardDescription>
          Configura los enlaces de invitación a los grupos de WhatsApp por deporte.
          Estos enlaces se asignarán automáticamente cuando se cree una salida.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="running">Grupo de Running</Label>
            <Input
              id="running"
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={config.gruposPorDeporte?.Running || ""}
              onChange={(e) => handleInputChange("Running", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enlace de invitación al grupo de WhatsApp de Running
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trekking">Grupo de Trekking</Label>
            <Input
              id="trekking"
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={config.gruposPorDeporte?.Trekking || ""}
              onChange={(e) => handleInputChange("Trekking", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enlace de invitación al grupo de WhatsApp de Trekking
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciclismo">Grupo de Ciclismo</Label>
            <Input
              id="ciclismo"
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={config.gruposPorDeporte?.Ciclismo || ""}
              onChange={(e) => handleInputChange("Ciclismo", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enlace de invitación al grupo de WhatsApp de Ciclismo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otros">Grupo de Otros Deportes</Label>
            <Input
              id="otros"
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={config.gruposPorDeporte?.Otros || ""}
              onChange={(e) => handleInputChange("Otros", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enlace de invitación al grupo de WhatsApp para otros deportes
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Configuración"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
