"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  DollarSign,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Mail,
} from "lucide-react";
import { AcademyFormDialog } from "@/components/forms/academy-form-dialog";
import { GroupsList } from "@/components/academies/groups-list";
import { SubscriptionsList } from "@/components/academies/subscriptions-list";
import type { Academy } from "@/lib/types";

interface AcademyDetailsProps {
  academia: Academy;
  grupos: any[];
}

export function AcademyDetails({ academia, grupos }: AcademyDetailsProps) {
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button onClick={() => setFormDialogOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Academia
          </Button>
        </div>

        {/* Imagen de la academia */}
        {academia.imagen && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border">
            <Image
              src={academia.imagen}
              alt={academia.nombre_academia}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Información principal */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">
                  {academia.nombre_academia}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="default">{academia.tipo_disciplina}</Badge>
                  <Badge variant={academia.clase_gratis ? "default" : "secondary"}>
                    {academia.clase_gratis ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Clase gratis disponible
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Sin clase gratis
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descripción */}
            {academia.descripcion && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground">{academia.descripcion}</p>
              </div>
            )}

            {/* Grid de información */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Ubicación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">País</p>
                    <p className="font-medium">{academia.pais}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Provincia</p>
                    <p className="font-medium">{academia.provincia}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Localidad</p>
                    <p className="font-medium">{academia.localidad}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-medium">
                      {academia.precio ? `$${academia.precio}` : "Gratis"}
                    </p>
                  </div>
                  {academia.cbu && (
                    <div>
                      <p className="text-sm text-muted-foreground">CBU</p>
                      <p className="font-mono text-sm">{academia.cbu}</p>
                    </div>
                  )}
                  {academia.alias && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alias</p>
                      <p className="font-medium">{academia.alias}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contacto */}
              {academia.telefono && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{academia.telefono}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información del dueño */}
              {academia.dueño_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Dueño de la Academia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-3">
                      {academia.dueño_id.imagen ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={academia.dueño_id.imagen}
                            alt={`${academia.dueño_id.firstname} ${academia.dueño_id.lastname}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {academia.dueño_id.firstname} {academia.dueño_id.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {academia.dueño_id.email}
                        </p>
                        {academia.dueño_id.telnumber && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {academia.dueño_id.telnumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <p>Fecha de creación</p>
                  <p className="font-medium text-foreground">
                    {new Date(academia.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p>Última actualización</p>
                  <p className="font-medium text-foreground">
                    {new Date(academia.updatedAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grupos de la academia */}
        <GroupsList academiaId={academia._id} grupos={grupos} />

        {/* Suscripciones de la academia */}
        <SubscriptionsList academiaId={academia._id} />
      </div>

      <AcademyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        academy={academia}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
