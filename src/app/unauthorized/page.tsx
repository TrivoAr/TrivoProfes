"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function UnauthorizedPage() {
  const handleGoToTrivo = () => {
    window.location.href = "https://trivo.com.ar";
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[#C95100]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Acceso Restringido
          </CardTitle>
          <CardDescription className="text-center">
            Este panel está disponible solo para profesores y administradores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Para acceder a la plataforma de usuarios, visita el sitio principal de Trivo.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleGoToTrivo}
              className="w-full bg-[#C95100] hover:bg-[#A04200]"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ir a Trivo.com.ar
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Cerrar Sesión
            </Button>
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-center text-muted-foreground">
              Si eres profesor o dueño de academia y no puedes acceder,
              contacta al administrador para verificar los permisos de tu cuenta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
