"use client";

import { useQuery } from "@tanstack/react-query";
import { MembersManagement } from "./members-management";

interface Usuario {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  rol: string;
  imageUrl?: string;
}

interface Pago {
  _id: string;
  comprobanteUrl?: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  tipoPago: "transferencia" | "mercadopago";
  amount?: number;
  createdAt: string;
}

interface Miembro {
  _id: string;
  usuario_id: Usuario;
  pago_id?: Pago;
  estado: "pendiente" | "aprobado" | "rechazado";
  rol: "miembro" | "organizador";
  fecha_union: string;
  createdAt: string;
}

interface MembersManagementClientProps {
  salidaId: string;
  salida: any;
}

export function MembersManagementClient({
  salidaId,
  salida,
}: MembersManagementClientProps) {
  const { data: miembros = [], isLoading, error } = useQuery<Miembro[]>({
    queryKey: ["members-with-images", salidaId],
    queryFn: async () => {
      const res = await fetch(`/api/outings/${salidaId}/members-with-images`, {
        cache: "no-store", // Forzar siempre fetch fresco
      });
      if (!res.ok) {
        throw new Error("Error al cargar los miembros");
      }
      return res.json();
    },
    staleTime: 0, // Considerar datos obsoletos inmediatamente
    gcTime: 0, // Reemplaza cacheTime en React Query v5
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando miembros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">
            Error al cargar los miembros. Por favor, intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return <MembersManagement salida={salida} miembros={miembros} />;
}
