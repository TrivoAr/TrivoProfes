"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, School, TrendingUp, ChevronDown, ChevronUp, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GrupoComision {
  grupo: {
    _id: string;
    nombre_grupo: string;
    nivel?: string;
    horario?: string;
    dias: string[];
  };
  profesor: {
    _id: string;
    nombre: string;
    email: string;
  } | null;
  studentCount: number;
  comisiones: {
    total_students: number;
    gross_income: number;
    teacher_total: number;
    trivo_total: number;
  };
}

interface AcademiaComision {
  academia: {
    _id: string;
    nombre_academia: string;
    tipo_disciplina: string;
    localidad: string;
    provincia: string;
  };
  dueño: {
    _id: string;
    nombre: string;
    email: string;
  };
  totales: {
    totalStudents: number;
    grossIncome: number;
    teacherTotal: number;
    trivoTotal: number;
  };
  grupos: GrupoComision[];
}

interface AdminCommissionsData {
  totalesPlataforma: {
    totalAcademias: number;
    totalGrupos: number;
    totalStudents: number;
    grossIncome: number;
    teacherTotal: number;
    trivoTotal: number;
  };
  academias: AcademiaComision[];
}

/**
 * Componente que muestra todas las comisiones para administradores
 * Obtiene los datos desde la API /api/comisiones/admin
 */
export function AdminCommissions() {
  const [data, setData] = useState<AdminCommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAcademias, setExpandedAcademias] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCommissions() {
      try {
        const response = await fetch("/api/comisiones/admin");

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

  const toggleAcademia = (academiaId: string) => {
    const newExpanded = new Set(expandedAcademias);
    if (newExpanded.has(academiaId)) {
      newExpanded.delete(academiaId);
    } else {
      newExpanded.add(academiaId);
    }
    setExpandedAcademias(newExpanded);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
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

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay datos de comisiones disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumen de la plataforma */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Trivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                ${data.totalesPlataforma.trivoTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Comisiones plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Profesores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                ${data.totalesPlataforma.teacherTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total a profesores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Brutos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                ${data.totalesPlataforma.grossIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.totalesPlataforma.totalStudents} alumnos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Academias y Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">
                {data.totalesPlataforma.totalAcademias}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.totalesPlataforma.totalGrupos} grupos totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de academias */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Academia</CardTitle>
          <CardDescription>
            Comisiones detalladas de cada academia y sus grupos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.academias.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay academias con grupos activos.
            </p>
          ) : (
            data.academias.map((academia) => (
              <Collapsible
                key={academia.academia._id}
                open={expandedAcademias.has(academia.academia._id)}
                onOpenChange={() => toggleAcademia(academia.academia._id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {academia.academia.nombre_academia}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {academia.academia.tipo_disciplina} • {academia.academia.localidad}, {academia.academia.provincia}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dueño: {academia.dueño.nombre} ({academia.dueño.email})
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Ingresos Trivo</p>
                            <p className="text-lg font-bold text-blue-700">
                              ${academia.totales.trivoTotal.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Profesores</p>
                            <p className="text-lg font-bold text-green-700">
                              ${academia.totales.teacherTotal.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {academia.grupos.length} grupo{academia.grupos.length !== 1 ? "s" : ""}
                          </Badge>
                          {expandedAcademias.has(academia.academia._id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grupo</TableHead>
                            <TableHead>Profesor</TableHead>
                            <TableHead className="text-center">Alumnos</TableHead>
                            <TableHead className="text-right">Ingreso Bruto</TableHead>
                            <TableHead className="text-right">A Profesor</TableHead>
                            <TableHead className="text-right">A Trivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {academia.grupos.map((grupo) => (
                            <TableRow key={grupo.grupo._id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{grupo.grupo.nombre_grupo}</p>
                                  {grupo.grupo.nivel && (
                                    <p className="text-xs text-muted-foreground">{grupo.grupo.nivel}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {grupo.profesor ? (
                                  <div>
                                    <p className="text-sm">{grupo.profesor.nombre}</p>
                                    <p className="text-xs text-muted-foreground">{grupo.profesor.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Sin asignar</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">
                                  {grupo.studentCount}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${grupo.comisiones.gross_income.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-700">
                                ${grupo.comisiones.teacher_total.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-blue-700">
                                ${grupo.comisiones.trivo_total.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
