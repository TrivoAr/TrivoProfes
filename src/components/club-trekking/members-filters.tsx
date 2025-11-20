"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MembersFilters {
  nombre: string;
  apellido: string;
  estado: string;
  tipoFecha: "ninguna" | "especifica" | "rango";
  fechaEspecifica: string;
  fechaDesde: string;
  fechaHasta: string;
}

interface MembersFiltersProps {
  onFiltersChange: (filters: MembersFilters) => void;
  activeFiltersCount: number;
}

export function MembersFiltersComponent({
  onFiltersChange,
  activeFiltersCount,
}: MembersFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<MembersFilters>({
    nombre: "",
    apellido: "",
    estado: "activa",
    tipoFecha: "ninguna",
    fechaEspecifica: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const handleFilterChange = (key: keyof MembersFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Si cambia el tipo de fecha, limpiar los campos de fecha
    if (key === "tipoFecha") {
      newFilters.fechaEspecifica = "";
      newFilters.fechaDesde = "";
      newFilters.fechaHasta = "";
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: MembersFilters = {
      nombre: "",
      apellido: "",
      estado: "activa",
      tipoFecha: "ninguna",
      fechaEspecifica: "",
      fechaDesde: "",
      fechaHasta: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant={isExpanded ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtrar Miembros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros de nombre y apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Buscar por nombre..."
                  value={filters.nombre}
                  onChange={(e) => handleFilterChange("nombre", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  placeholder="Buscar por apellido..."
                  value={filters.apellido}
                  onChange={(e) => handleFilterChange("apellido", e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado de Suscripción</Label>
              <Select
                value={filters.estado}
                onValueChange={(value) => handleFilterChange("estado", value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="todas">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de fecha */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoFecha" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Filtrar por Fecha de Inicio
                </Label>
                <Select
                  value={filters.tipoFecha}
                  onValueChange={(value) =>
                    handleFilterChange("tipoFecha", value as any)
                  }
                >
                  <SelectTrigger id="tipoFecha">
                    <SelectValue placeholder="Tipo de filtro de fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguna">Sin filtro de fecha</SelectItem>
                    <SelectItem value="especifica">Fecha específica</SelectItem>
                    <SelectItem value="rango">Rango de fechas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha específica */}
              {filters.tipoFecha === "especifica" && (
                <div className="space-y-2">
                  <Label htmlFor="fechaEspecifica">Fecha</Label>
                  <Input
                    id="fechaEspecifica"
                    type="date"
                    value={filters.fechaEspecifica}
                    onChange={(e) =>
                      handleFilterChange("fechaEspecifica", e.target.value)
                    }
                  />
                </div>
              )}

              {/* Rango de fechas */}
              {filters.tipoFecha === "rango" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaDesde">Desde</Label>
                    <Input
                      id="fechaDesde"
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) =>
                        handleFilterChange("fechaDesde", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaHasta">Hasta</Label>
                    <Input
                      id="fechaHasta"
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) =>
                        handleFilterChange("fechaHasta", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button onClick={handleApplyFilters} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
