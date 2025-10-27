"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MembersTable } from "./members-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MembersResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function MembersTableClient() {
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, error } = useQuery<MembersResponse>({
    queryKey: ["users-with-images", page],
    queryFn: async () => {
      const res = await fetch(`/api/users/with-images?page=${page}&limit=${limit}`);
      if (!res.ok) {
        throw new Error("Error al cargar los usuarios");
      }
      return res.json();
    },
    staleTime: 60 * 1000, // Cache por 1 minuto
    placeholderData: (previousData) => previousData, // Reemplaza keepPreviousData
  });

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">
            Error al cargar los usuarios. Por favor, intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }

  const members = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <MembersTable members={members} />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, pagination.total)} de {pagination.total} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasMore || isLoading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
