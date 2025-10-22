"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PaymentReviewModal } from "./payment-review-modal";

interface Usuario {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  imagen?: string;
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

interface Salida {
  _id: string;
  nombre: string;
  fecha?: string;
  cupo: number;
  precio?: string;
}

interface MembersManagementProps {
  salida: Salida;
  miembros: Miembro[];
}

export function MembersManagement({ salida, miembros }: MembersManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtrar miembros
  const filteredMiembros = miembros.filter((miembro) => {
    const matchesSearch =
      miembro.usuario_id.firstname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      miembro.usuario_id.lastname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      miembro.usuario_id.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEstado =
      filterEstado === "all" || miembro.estado === filterEstado;

    return matchesSearch && matchesEstado;
  });

  // Estadísticas
  const stats = {
    total: miembros.length,
    aprobados: miembros.filter((m) => m.estado === "aprobado").length,
    pendientes: miembros.filter((m) => m.estado === "pendiente").length,
    rechazados: miembros.filter((m) => m.estado === "rechazado").length,
  };

  const handleViewComprobante = (pago: Pago) => {
    setSelectedPago(pago);
    setReviewModalOpen(true);
  };

  const handleApprove = async (pagoId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pagos/${pagoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "aprobado" }),
      });

      if (!res.ok) {
        throw new Error("Error al aprobar el pago");
      }

      toast({
        title: "Pago aprobado",
        description: "El pago ha sido aprobado exitosamente.",
      });

      setReviewModalOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (pagoId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/pagos/${pagoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "rechazado" }),
      });

      if (!res.ok) {
        throw new Error("Error al rechazar el pago");
      }

      toast({
        title: "Pago rechazado",
        description: "El pago ha sido rechazado.",
        variant: "destructive",
      });

      setReviewModalOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case "rechazado":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      case "pendiente":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={() => router.push(`/outings/${salida._id}`)}
            className="gap-2 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{salida.nombre}</h1>
            <p className="text-sm text-muted-foreground">Gestión de Participantes</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Miembros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Cupo: {stats.aprobados}/{salida.cupo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.aprobados}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rechazados}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="aprobado">Aprobados</SelectItem>
                  <SelectItem value="rechazado">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Miembros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Participantes ({filteredMiembros.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMiembros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron participantes
              </p>
            </div>
          ) : (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden md:block rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participante</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Fecha de Unión</TableHead>
                      <TableHead>Tipo de Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMiembros.map((miembro) => (
                    <TableRow key={miembro._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={miembro.usuario_id.imagen}
                              alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                            />
                            <AvatarFallback>
                              {miembro.usuario_id.firstname[0]}
                              {miembro.usuario_id.lastname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {miembro.usuario_id.firstname}{" "}
                              {miembro.usuario_id.lastname}
                            </p>
                            {miembro.rol === "organizador" && (
                              <Badge variant="outline" className="text-xs">
                                Organizador
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{miembro.usuario_id.email}</TableCell>
                      <TableCell>
                        {format(new Date(miembro.fecha_union), "PPp", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        {miembro.pago_id ? (
                          <Badge variant="outline">
                            {miembro.pago_id.tipoPago === "transferencia"
                              ? "Transferencia"
                              : "MercadoPago"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sin pago
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getEstadoBadge(miembro.estado)}</TableCell>
                      <TableCell className="text-right">
                        {miembro.pago_id &&
                          miembro.pago_id.comprobanteUrl &&
                          miembro.estado === "pendiente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewComprobante(miembro.pago_id!)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Comprobante
                            </Button>
                          )}
                        {miembro.estado === "aprobado" && (
                          <span className="text-sm text-green-600">
                            ✓ Confirmado
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vista Móvil - Cards */}
              <div className="md:hidden space-y-4">
                {filteredMiembros.map((miembro) => (
                  <div key={miembro._id} className="border rounded-lg p-4 space-y-3">
                    {/* Header del participante */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={miembro.usuario_id.imagen}
                          alt={`${miembro.usuario_id.firstname} ${miembro.usuario_id.lastname}`}
                        />
                        <AvatarFallback>
                          {miembro.usuario_id.firstname[0]}
                          {miembro.usuario_id.lastname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                          {miembro.usuario_id.firstname}{" "}
                          {miembro.usuario_id.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {miembro.usuario_id.email}
                        </p>
                        {miembro.rol === "organizador" && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Organizador
                          </Badge>
                        )}
                      </div>
                      {getEstadoBadge(miembro.estado)}
                    </div>

                    {/* Información */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha de unión:</span>
                        <span className="font-medium">
                          {format(new Date(miembro.fecha_union), "PP", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo de pago:</span>
                        {miembro.pago_id ? (
                          <Badge variant="outline" className="text-xs">
                            {miembro.pago_id.tipoPago === "transferencia"
                              ? "Transferencia"
                              : "MercadoPago"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Sin pago</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {miembro.pago_id &&
                      miembro.pago_id.comprobanteUrl &&
                      miembro.estado === "pendiente" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewComprobante(miembro.pago_id!)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Comprobante
                        </Button>
                      )}
                    {miembro.estado === "aprobado" && (
                      <div className="text-center text-sm text-green-600 font-medium">
                        ✓ Confirmado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Review Modal */}
      {selectedPago && (
        <PaymentReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          pago={selectedPago}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
