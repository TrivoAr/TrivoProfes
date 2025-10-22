"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  CreditCard,
  Check,
  X,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNotifications, type Notificacion } from "@/hooks/useNotifications";
import { PageHeader } from "@/components/page-header";

export function NotificationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

  const {
    notificaciones,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    pollingInterval: 30000,
    showToast: false, // No mostrar toasts en esta página
  });

  const handleNotificationClick = (notif: Notificacion) => {
    // Marcar como leída
    if (!notif.read) {
      markAsRead(notif._id);
    }

    // Navegar según el tipo usando shortId del metadata
    const shortId = notif.metadata?.shortId;

    if (!shortId) {
      console.warn("No se encontró shortId en la notificación");
      return;
    }

    if (notif.type === "joined_event" || notif.type === "payment_pending") {
      // Redirigir a la página de detalles de la salida con hash para scroll a miembros
      router.push(`/outings/${shortId}#miembros`);
    } else if (notif.type === "pago_aprobado" || notif.type === "pago_rechazado") {
      // Redirigir a la página de detalles de la salida
      router.push(`/outings/${shortId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "joined_event":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "payment_pending":
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      case "pago_aprobado":
        return <Check className="h-5 w-5 text-green-500" />;
      case "pago_rechazado":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "joined_event":
        return "Nuevo participante";
      case "payment_pending":
        return "Comprobante recibido";
      case "pago_aprobado":
        return "Pago aprobado";
      case "pago_rechazado":
        return "Pago rechazado";
      default:
        return type;
    }
  };

  // Filtrar notificaciones
  const filteredNotifications = notificaciones.filter((notif) => {
    const matchesSearch =
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.metadata?.salidaNombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.metadata?.userName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || notif.type === filterType;

    const matchesRead =
      filterRead === "all" ||
      (filterRead === "unread" && !notif.read) ||
      (filterRead === "read" && notif.read);

    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <PageHeader
        title="Notificaciones"
        description="Gestiona todas tus notificaciones"
      />

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificaciones.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">
              No Leídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Leídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notificaciones.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Acciones */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar notificaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por tipo */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="payment_pending">
                      Comprobantes recibidos
                    </SelectItem>
                    <SelectItem value="joined_event">
                      Nuevos participantes
                    </SelectItem>
                    <SelectItem value="pago_aprobado">
                      Pagos aprobados
                    </SelectItem>
                    <SelectItem value="pago_rechazado">
                      Pagos rechazados
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro por leído/no leído */}
                <Select value={filterRead} onValueChange={setFilterRead}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">No leídas</SelectItem>
                    <SelectItem value="read">Leídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Marcar todas como leídas */}
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredNotifications.length === notificaciones.length
              ? `Todas las notificaciones (${notificaciones.length})`
              : `Mostrando ${filteredNotifications.length} de ${notificaciones.length}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && notificaciones.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {notificaciones.length === 0
                  ? "No tienes notificaciones"
                  : "No se encontraron notificaciones"}
              </p>
              <p className="text-sm text-muted-foreground">
                {notificaciones.length === 0
                  ? "Te notificaremos cuando haya novedades"
                  : "Intenta con otros filtros"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer group hover:shadow-md ${
                    !notif.read
                      ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex gap-4">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notif.type)}
                            </Badge>
                            {!notif.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nueva
                              </Badge>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              !notif.read ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {notif.message}
                          </p>
                          {notif.metadata?.salidaNombre && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {notif.metadata.salidaNombre}
                            </p>
                          )}
                        </div>

                        {/* Botón eliminar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notif.createdAt), "PPPp", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
