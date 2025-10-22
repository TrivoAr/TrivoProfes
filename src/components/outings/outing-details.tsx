"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
  User,
  Trophy,
  MessageCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DIFICULTAD_LABELS } from "@/lib/constants/salidas";

interface Miembro {
  _id: string;
  usuario_id: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    imagen?: string;
  };
  estado: "pendiente" | "aprobado" | "rechazado";
  createdAt: string;
}

interface Salida {
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
  locationCoords?: {
    lat: number;
    lng: number;
  };
  dificultad?: string;
  precio?: string;
  cupo: number;
  cbu?: string;
  alias?: string;
  whatsappLink?: string;
  shortId: string;
  creador_id: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    imagen?: string;
  };
  sponsor_id?: {
    _id: string;
    name: string;
    imagen?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OutingDetailsProps {
  salida: Salida;
  miembros: Miembro[];
}

export function OutingDetails({ salida, miembros }: OutingDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const miembrosAprobados = miembros.filter((m) => m.estado === "aprobado");
  const miembrosPendientes = miembros.filter((m) => m.estado === "pendiente");

  // Scroll suave a la sección de miembros si viene del hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#miembros") {
      const element = document.getElementById("miembros");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const getEstadoBadge = () => {
    if (!salida.fecha) {
      return <Badge variant="secondary">Sin fecha definida</Badge>;
    }

    const fechaSalida = new Date(salida.fecha);
    const hoy = new Date();

    if (fechaSalida > hoy) {
      return <Badge className="bg-green-500">Activa</Badge>;
    } else {
      return <Badge variant="secondary">Finalizada</Badge>;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/salidas/${salida._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la salida");
      }

      toast({
        title: "Salida eliminada",
        description: `La salida "${salida.nombre}" ha sido eliminada exitosamente.`,
      });

      router.push("/outings");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la salida. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex gap-2">
          <Link href={`/outings/${salida._id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl">{salida.nombre}</CardTitle>
                    {getEstadoBadge()}
                  </div>
                  {salida.deporte && (
                    <Badge variant="outline">{salida.deporte}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Imagen */}
              {salida.imagen && (
                <div className="relative w-full h-80 rounded-lg overflow-hidden">
                  <Image
                    src={salida.imagen}
                    alt={salida.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Descripción */}
              {salida.descripcion && (
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {salida.descripcion}
                  </p>
                </div>
              )}

              <Separator />

              {/* Información de la actividad */}
              <div className="grid gap-4 sm:grid-cols-2">
                {salida.fecha && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(salida.fecha), "PPP", { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {salida.hora && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hora</p>
                      <p className="text-sm text-muted-foreground">
                        {salida.hora}
                      </p>
                    </div>
                  </div>
                )}

                {salida.duracion && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duración</p>
                      <p className="text-sm text-muted-foreground">
                        {salida.duracion}
                      </p>
                    </div>
                  </div>
                )}

                {salida.dificultad && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Dificultad</p>
                      <p className="text-sm text-muted-foreground">
                        {DIFICULTAD_LABELS[salida.dificultad as keyof typeof DIFICULTAD_LABELS] ||
                          salida.dificultad}
                      </p>
                    </div>
                  </div>
                )}

                {(salida.localidad || salida.provincia) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ubicación</p>
                      <p className="text-sm text-muted-foreground">
                        {[salida.localidad, salida.provincia]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {salida.precio && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Precio</p>
                      <p className="text-sm text-muted-foreground">
                        {salida.precio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de pago */}
              {(salida.cbu || salida.alias) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Información de Pago</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {salida.cbu && (
                        <div>
                          <p className="text-sm font-medium">CBU</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {salida.cbu}
                          </p>
                        </div>
                      )}
                      {salida.alias && (
                        <div>
                          <p className="text-sm font-medium">Alias</p>
                          <p className="text-sm text-muted-foreground">
                            {salida.alias}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Contacto */}
              {(salida.telefonoOrganizador || salida.whatsappLink) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Contacto</h3>
                    <div className="flex flex-col gap-2">
                      {salida.telefonoOrganizador && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{salida.telefonoOrganizador}</span>
                        </div>
                      )}
                      {salida.whatsappLink && (
                        <a
                          href={salida.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Unirse al grupo de WhatsApp
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Miembros */}
          <Card id="miembros">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes ({miembrosAprobados.length}/{salida.cupo})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {miembros.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aún no hay participantes en esta salida
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Miembros aprobados */}
                  {miembrosAprobados.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Confirmados</h4>
                      <div className="grid gap-3">
                        {miembrosAprobados.map((miembro) => (
                          <div
                            key={miembro._id}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                          >
                            <Avatar>
                              <AvatarImage
                                src={miembro.usuario_id.imagen}
                                alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                              />
                              <AvatarFallback>
                                {miembro.usuario_id.firstname[0]}
                                {miembro.usuario_id.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {miembro.usuario_id.firstname}{" "}
                                {miembro.usuario_id.lastname}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {miembro.usuario_id.email}
                              </p>
                            </div>
                            <Badge className="bg-green-500">Confirmado</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Miembros pendientes */}
                  {miembrosPendientes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        Pendientes de aprobación
                      </h4>
                      <div className="grid gap-3">
                        {miembrosPendientes.map((miembro) => (
                          <div
                            key={miembro._id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50"
                          >
                            <Avatar>
                              <AvatarImage
                                src={miembro.usuario_id.imagen}
                                alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                              />
                              <AvatarFallback>
                                {miembro.usuario_id.firstname[0]}
                                {miembro.usuario_id.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {miembro.usuario_id.firstname}{" "}
                                {miembro.usuario_id.lastname}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {miembro.usuario_id.email}
                              </p>
                            </div>
                            <Badge variant="outline">Pendiente</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link href={`/outings/${salida._id}/miembros`}>
                  <Button variant="outline" className="w-full">
                    Gestionar Participantes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Organizador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={salida.creador_id.imagen}
                    alt={`${salida.creador_id.firstname} ${salida.creador_id.lastname}`}
                  />
                  <AvatarFallback>
                    {salida.creador_id.firstname[0]}
                    {salida.creador_id.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {salida.creador_id.firstname} {salida.creador_id.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {salida.creador_id.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsor */}
          {salida.sponsor_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Sponsor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {salida.sponsor_id.imagen && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={salida.sponsor_id.imagen}
                        alt={salida.sponsor_id.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <p className="font-medium">{salida.sponsor_id.name}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cupo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confirmados</span>
                  <span className="font-medium">
                    {miembrosAprobados.length} / {salida.cupo}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(miembrosAprobados.length / salida.cupo) * 100}%`,
                    }}
                  />
                </div>
                {miembrosAprobados.length >= salida.cupo && (
                  <p className="text-sm text-orange-600 font-medium">
                    ¡Cupo completo!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              salida "{salida.nombre}" y todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
