"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateCommissions } from "@/utils/commissionCalculator";
import { DollarSign, Users, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Componente simulador de comisiones
 * Permite simular cálculos de comisiones ingresando una cantidad de alumnos
 */
export function CommissionSimulator() {
  const [studentCount, setStudentCount] = useState<number>(5);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const calculation = calculateCommissions(studentCount);

  return (
    <div className="space-y-4">
      {/* Input para simular */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Comisiones</CardTitle>
          <CardDescription>
            Simula tus ganancias según la cantidad de alumnos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-count">Cantidad de Alumnos</Label>
              <Input
                id="student-count"
                type="number"
                min="0"
                max="100"
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumen */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tu Ganancia Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold text-green-700">
                ${calculation.teacher_total.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Con {calculation.total_students} alumno{calculation.total_students !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingreso Total del Grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold text-blue-700">
                ${calculation.gross_income.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${25000} × {calculation.total_students} alumno{calculation.total_students !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por alumno (opcional) */}
      {calculation.total_students > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Desglose por Alumno</CardTitle>
                <CardDescription>
                  Comisión por cada alumno según orden de inscripción
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showBreakdown && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Tasa Aplicada</TableHead>
                      <TableHead className="text-right">Tu Comisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculation.breakdown.map((item) => (
                      <TableRow key={item.student_position}>
                        <TableCell className="font-medium">
                          Alumno #{item.student_position}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {(item.applied_rate * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          ${item.teacher_cut.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Información sobre tramos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estructura de Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Alumnos 1-3:</span>
              <span className="font-semibold">70% para ti</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Alumnos 4-5:</span>
              <span className="font-semibold">35% para ti</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Alumnos 6-10:</span>
              <span className="font-semibold">37% para ti</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Alumnos 11-15:</span>
              <span className="font-semibold">38% para ti</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Alumnos 16-20:</span>
              <span className="font-semibold">39% para ti</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Alumnos 21+:</span>
              <span className="font-semibold">40% para ti</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
