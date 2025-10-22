"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import type { SocialOuting } from "@/lib/types";

export interface OutingsFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  precioMin?: string;
  precioMax?: string;
  provincia?: string;
  localidad?: string;
  deporte?: string;
}

interface OutingsFiltersProps {
  outings: SocialOuting[];
  onFilterChange: (filters: OutingsFilters) => void;
}

export function OutingsFiltersComponent({
  outings,
  onFilterChange,
}: OutingsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<OutingsFilters>({});

  // Extraer valores únicos para los selectores
  const deportes = Array.from(
    new Set(outings.map((o) => o.deporte).filter(Boolean))
  ).sort() as string[];
  const provincias = Array.from(
    new Set(outings.map((o) => o.provincia).filter(Boolean))
  ).sort() as string[];
  const localidades = Array.from(
    new Set(outings.map((o) => o.localidad).filter(Boolean))
  ).sort() as string[];

  // Actualizar filtros cuando cambian
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof OutingsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
          {/* Filtros de Fecha */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Fecha Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={filters.fechaDesde || ""}
                onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Fecha Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={filters.fechaHasta || ""}
                onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
              />
            </div>
          </div>

          {/* Filtros de Precio */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="precioMin">Precio Mínimo</Label>
              <Input
                id="precioMin"
                type="number"
                placeholder="Ej: 0"
                value={filters.precioMin || ""}
                onChange={(e) => handleFilterChange("precioMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioMax">Precio Máximo</Label>
              <Input
                id="precioMax"
                type="number"
                placeholder="Ej: 10000"
                value={filters.precioMax || ""}
                onChange={(e) => handleFilterChange("precioMax", e.target.value)}
              />
            </div>
          </div>

          {/* Filtros de Ubicación */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Select
                value={filters.provincia || "all"}
                onValueChange={(value) =>
                  handleFilterChange("provincia", value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="provincia">
                  <SelectValue placeholder="Todas las provincias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las provincias</SelectItem>
                  {provincias.map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Select
                value={filters.localidad || "all"}
                onValueChange={(value) =>
                  handleFilterChange("localidad", value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="localidad">
                  <SelectValue placeholder="Todas las localidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las localidades</SelectItem>
                  {localidades.map((localidad) => (
                    <SelectItem key={localidad} value={localidad}>
                      {localidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtro de Deporte */}
          <div className="space-y-2">
            <Label htmlFor="deporte">Deporte</Label>
            <Select
              value={filters.deporte || "all"}
              onValueChange={(value) =>
                handleFilterChange("deporte", value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="deporte">
                <SelectValue placeholder="Todos los deportes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los deportes</SelectItem>
                {deportes.map((deporte) => (
                  <SelectItem key={deporte} value={deporte}>
                    {deporte}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
