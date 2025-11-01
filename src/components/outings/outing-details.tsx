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
  Share2,
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
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

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

  const handleCopyLink = async () => {
    const shareLink = `https://trivo.com.ar/s/${salida.shortId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copiado",
        description: "El link de la salida ha sido copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link. Intenta nuevamente.",
        variant: "destructive",
      });
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
    <div className="w-full mx-auto py-3 sm:py-4 lg:py-6 px-0 min-w-0">
      {/* Header con acciones */}
      <div className="flex flex-col gap-2 mb-3 sm:mb-4 lg:mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 self-start h-8 text-xs sm:text-sm"
          size="sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Button>

        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial h-7 sm:h-8 px-1.5 sm:px-3 text-xs min-w-0"
            size="sm"
          >
            <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">Compartir</span>
          </Button>
          <Link href={`/outings/${salida._id}/edit`} className="flex-1 sm:flex-initial min-w-0">
            <Button variant="outline" className="w-full h-7 sm:h-8 px-1.5 sm:px-3 text-xs min-w-0" size="sm">
              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs">Editar</span>
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex-1 sm:flex-initial h-7 sm:h-8 px-1.5 sm:px-3 text-xs min-w-0"
            size="sm"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">Eliminar</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-3 min-w-0">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
          {/* Información Principal */}
          <Card className="overflow-hidden min-w-0">
            <CardHeader className="p-2.5 sm:p-3 lg:p-6">
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <CardTitle className="text-sm sm:text-base lg:text-xl break-words flex-1 min-w-0">{salida.nombre}</CardTitle>
                  <div className="flex-shrink-0">{getEstadoBadge()}</div>
                </div>
                {salida.deporte && (
                  <Badge variant="outline" className="text-xs">{salida.deporte}</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 sm:space-y-3 lg:space-y-6 p-2.5 sm:p-3 lg:p-6 min-w-0">
              {/* Imagen */}
              {salida.imagen && (
                <div className="relative w-full h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden">
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
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Descripción</h3>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap break-words">
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
          <Card id="miembros" className="min-w-0">
            <CardHeader className="p-2.5 sm:p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Participantes ({miembrosAprobados.length}/{salida.cupo})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-3 lg:p-6 min-w-0">
              {miembros.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aún no hay participantes en esta salida
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  {/* Miembros aprobados */}
                  {miembrosAprobados.length > 0 && (
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Confirmados</h4>
                      <div className="grid gap-2 sm:gap-3 min-w-0">
                        {miembrosAprobados.map((miembro) => (
                          <div
                            key={miembro._id}
                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border min-w-0"
                          >
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage
                                src={miembro.usuario_id.imagen}
                                alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                              />
                              <AvatarFallback className="text-xs">
                                {miembro.usuario_id.firstname[0]}
                                {miembro.usuario_id.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                {miembro.usuario_id.firstname}{" "}
                                {miembro.usuario_id.lastname}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {miembro.usuario_id.email}
                              </p>
                            </div>
                            <Badge className="bg-green-500 text-xs flex-shrink-0">Confirmado</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Miembros pendientes */}
                  {miembrosPendientes.length > 0 && (
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                        Pendientes de aprobación
                      </h4>
                      <div className="grid gap-2 sm:gap-3 min-w-0">
                        {miembrosPendientes.map((miembro) => (
                          <div
                            key={miembro._id}
                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-orange-200 bg-orange-50 min-w-0"
                          >
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage
                                src={miembro.usuario_id.imagen}
                                alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                              />
                              <AvatarFallback className="text-xs">
                                {miembro.usuario_id.firstname[0]}
                                {miembro.usuario_id.lastname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                {miembro.usuario_id.firstname}{" "}
                                {miembro.usuario_id.lastname}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {miembro.usuario_id.email}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">Pendiente</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 sm:mt-4">
                <Link href={`/outings/${salida._id}/miembros`}>
                  <Button variant="outline" className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                    Gestionar Participantes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
          {/* Organizador */}
          <Card className="min-w-0">
            <CardHeader className="p-2.5 sm:p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Organizador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-3 lg:p-6 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 flex-shrink-0">
                  <AvatarImage
                    src={salida.creador_id.imagen}
                    alt={`${salida.creador_id.firstname} ${salida.creador_id.lastname}`}
                  />
                  <AvatarFallback className="text-xs">
                    {salida.creador_id.firstname[0]}
                    {salida.creador_id.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">
                    {salida.creador_id.firstname} {salida.creador_id.lastname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {salida.creador_id.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsor */}
          {salida.sponsor_id && (
            <Card className="min-w-0">
              <CardHeader className="p-2.5 sm:p-3 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Sponsor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 sm:p-3 lg:p-6 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {salida.sponsor_id.imagen && (
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0">
                      <Image
                        src={salida.sponsor_id.imagen}
                        alt={salida.sponsor_id.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <p className="font-medium text-xs sm:text-sm truncate">{salida.sponsor_id.name}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cupo */}
          <Card className="min-w-0">
            <CardHeader className="p-2.5 sm:p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-3 lg:p-6">
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
