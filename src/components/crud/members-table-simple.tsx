"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface Member {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  rol: string;
  telnumber?: string;
  createdAt: string;
}

interface MembersResponse {
  users: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function MembersTableSimple() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<MembersResponse>({
    queryKey: ["users-infinite", debouncedSearch, roleFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: (pageParam as number).toString(),
        limit: "50",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      });

      const res = await fetch(`/api/users/with-images?${params}`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: 60 * 1000,
  });

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMembers = data?.pages.flatMap((page) => page.users) ?? [];
  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
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

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="profe">Profesor</SelectItem>
            <SelectItem value="alumno">Alumno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {totalCount > 0 ? (
          <>
            Mostrando {allMembers.length} de {totalCount} usuarios
            {(debouncedSearch || roleFilter !== "all") && " (filtrados)"}
          </>
        ) : (
          "No se encontraron usuarios"
        )}
      </div>

      {/* Lista de miembros */}
      {allMembers.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {allMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-4 border-b px-4 py-3 hover:bg-muted/50 transition-colors last:border-0"
              >
                <UserAvatar
                  userId={member._id}
                  firstName={member.firstname}
                  lastName={member.lastname}
                  className="h-10 w-10 rounded-full"
                  size={40}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.firstname} {member.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                </div>
                <Badge variant={member.rol === "admin" ? "default" : "secondary"}>
                  {member.rol}
                </Badge>
                {member.telnumber && (
                  <p className="text-sm text-muted-foreground hidden md:block">
                    {member.telnumber}
                  </p>
                )}
              </div>
            ))}

            {/* Trigger para cargar más */}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        </div>
      )}

      {/* Indicador de carga al final */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Cargando más usuarios...
          </span>
        </div>
      )}
    </div>
  );
}
