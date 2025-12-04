"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, School, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GrupoComision {
  grupo: {
    _id: string;
    nombre_grupo: string;
    nivel?: string;
    horario?: string;
    dias: string[];
  };
  academia: {
    _id: string;
    nombre_academia: string;
  };
  studentCount: number;
  comisiones: {
    total_students: number;
    gross_income: number;
    teacher_total: number;
  };
}

interface TeacherCommissionsData {
  profesor: {
    id: string;
    nombre: string;
  };
  totales: {
    totalStudents: number;
    totalIncome: number;
    totalGroups: number;
  };
  grupos: GrupoComision[];
}

/**
 * Componente que muestra las comisiones reales de un profesor
 * Obtiene los datos desde la API /api/comisiones/profesor
 */
export function TeacherCommissions() {
  const [data, setData] = useState<TeacherCommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommissions() {
      try {
        const response = await fetch("/api/comisiones/profesor");

        if (!response.ok) {
          throw new Error("Error al cargar las comisiones");
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.grupos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No tienes grupos asignados aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards de resumen totales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tus Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold text-green-700">
                ${data.totales.totalIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              De {data.totales.totalGroups} grupo{data.totales.totalGroups !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alumnos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold text-blue-700">
                {data.totales.totalStudents}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Alumnos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-purple-600" />
              <span className="text-3xl font-bold text-purple-700">
                {data.totales.totalGroups}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Grupos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Grupo</CardTitle>
          <CardDescription>
            Detalle de ingresos por cada uno de tus grupos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Vista Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Academia</TableHead>
                  <TableHead className="text-center">Alumnos</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead className="text-right">Tu Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.grupos.map((grupo) => (
                  <TableRow key={grupo.grupo._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grupo.grupo.nombre_grupo}</p>
                        {grupo.grupo.nivel && (
                          <p className="text-sm text-muted-foreground">{grupo.grupo.nivel}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{grupo.academia.nombre_academia}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {grupo.studentCount} alumno{grupo.studentCount !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {grupo.grupo.horario && <p>{grupo.grupo.horario}</p>}
                        <p className="text-muted-foreground">
                          {grupo.grupo.dias.join(", ")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-700 text-lg">
                        ${grupo.comisiones.teacher_total.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Vista Móvil */}
          <div className="md:hidden space-y-4">
            {data.grupos.map((grupo) => (
              <div key={grupo.grupo._id} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{grupo.grupo.nombre_grupo}</h3>
                  <p className="text-sm text-muted-foreground">{grupo.academia.nombre_academia}</p>
                  {grupo.grupo.nivel && (
                    <p className="text-sm text-muted-foreground">{grupo.grupo.nivel}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alumnos:</span>
                  <Badge variant="secondary">
                    {grupo.studentCount} alumno{grupo.studentCount !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Horario:</span>
                  <div className="text-sm text-right">
                    {grupo.grupo.horario && <p>{grupo.grupo.horario}</p>}
                    <p className="text-muted-foreground text-xs">
                      {grupo.grupo.dias.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Tu Ganancia:</span>
                  <span className="font-semibold text-green-700 text-lg">
                    ${grupo.comisiones.teacher_total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
