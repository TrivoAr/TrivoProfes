"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";

export interface Notificacion {
  _id: string;
  userId: string;
  type: "payment_pending" | "joined_event" | "pago_aprobado" | "pago_rechazado";
  message: string;
  read: boolean;
  relatedId?: string;
  relatedUserId?: string;
  metadata?: {
    salidaNombre?: string;
    userName?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsOptions {
  pollingInterval?: number; // En milisegundos (default: 30000 = 30 segundos)
  enabled?: boolean; // Si está deshabilitado, no hace polling
  showToast?: boolean; // Si debe mostrar toast automático
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    pollingInterval = 30000,
    enabled = true,
    showToast = true,
  } = options;

  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para trackear las notificaciones anteriores
  const previousNotificationsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated" || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/notificaciones?limit=50");
      if (!res.ok) {
        throw new Error("Error al obtener notificaciones");
      }

      const data = await res.json();
      const newNotificaciones: Notificacion[] = data.notificaciones || [];
      const newUnreadCount = data.unreadCount || 0;

      // Detectar notificaciones nuevas (que no estaban antes)
      const newNotificationIds = new Set(newNotificaciones.map((n) => n._id));
      const previousIds = previousNotificationsRef.current;

      const addedNotifications = newNotificaciones.filter(
        (n) => !previousIds.has(n._id) && !n.read
      );

      // Mostrar toast solo para notificaciones nuevas no leídas
      if (showToast && addedNotifications.length > 0) {
        addedNotifications.forEach((notif) => {
          const handleClick = () => {
            // Marcar como leída
            markAsRead(notif._id);

            // Navegar según el tipo
            if (notif.type === "joined_event" || notif.type === "payment_pending") {
              if (notif.relatedId) {
                router.push(`/outings/${notif.relatedId}/miembros`);
              }
            } else if (notif.type === "pago_aprobado") {
              if (notif.relatedId) {
                router.push(`/outings/${notif.relatedId}`);
              }
            }
          };

          toast({
            title: getNotificationTitle(notif.type),
            description: notif.message,
            duration: 8000,
            onClick: handleClick,
            className: "cursor-pointer hover:bg-accent",
          });
        });
      }

      // Actualizar ref con los IDs actuales
      previousNotificationsRef.current = newNotificationIds;

      setNotificaciones(newNotificaciones);
      setUnreadCount(newUnreadCount);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [status, enabled, showToast, toast, router]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notificaciones/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (!res.ok) throw new Error("Error al marcar como leída");

      // Actualizar localmente
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Error marking as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notificaciones/mark-all-read", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al marcar todas como leídas");

      // Actualizar localmente
      setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notificaciones/${notificationId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar notificación");

      // Actualizar localmente
      setNotificaciones((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => {
        const deletedNotif = notificaciones.find((n) => n._id === notificationId);
        return deletedNotif && !deletedNotif.read ? prev - 1 : prev;
      });
    } catch (err: any) {
      console.error("Error deleting notification:", err);
    }
  }, [notificaciones]);

  // Fetch inicial
  useEffect(() => {
    if (status === "authenticated" && enabled) {
      fetchNotifications();
    }
  }, [status, enabled, fetchNotifications]);

  // Polling
  useEffect(() => {
    if (status !== "authenticated" || !enabled || pollingInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [status, enabled, pollingInterval, fetchNotifications]);

  return {
    notificaciones,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

// Helper para obtener el título según el tipo
function getNotificationTitle(type: string): string {
  switch (type) {
    case "joined_event":
      return "Nuevo participante";
    case "payment_pending":
      return "Comprobante recibido";
    case "pago_aprobado":
      return "Pago aprobado ✅";
    case "pago_rechazado":
      return "Pago rechazado ❌";
    default:
      return "Nueva notificación";
  }
}
