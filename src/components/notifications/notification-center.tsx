"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Users,
  CreditCard,
  UserPlus,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, type Notificacion } from "@/hooks/useNotifications";

export function NotificationCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    notificaciones,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    pollingInterval: 30000, // 30 segundos
    showToast: true,
  });

  const handleNotificationClick = (notif: Notificacion) => {
    // Marcar como leída
    if (!notif.read) {
      markAsRead(notif._id);
    }

    // Cerrar popover
    setOpen(false);

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

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "joined_event":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "payment_pending":
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      case "pago_aprobado":
        return <Check className="h-4 w-4 text-green-500" />;
      case "pago_rechazado":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 gap-1 text-xs"
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading && notificaciones.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No tienes notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Te notificaremos cuando haya novedades
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 cursor-pointer transition-all group ${
                    !notif.read
                      ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notif.read ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => handleDelete(e, notif._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {notif.metadata?.salidaNombre && (
                        <p className="text-xs text-muted-foreground">
                          {notif.metadata.salidaNombre}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notif.createdAt), "PPp", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notificaciones.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
