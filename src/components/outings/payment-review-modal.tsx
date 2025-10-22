"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Download, ZoomIn, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Pago {
  _id: string;
  comprobanteUrl?: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  tipoPago: "transferencia" | "mercadopago";
  amount?: number;
  createdAt: string;
}

interface PaymentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: Pago;
  onApprove: (pagoId: string) => Promise<void>;
  onReject: (pagoId: string) => Promise<void>;
  isProcessing: boolean;
}

export function PaymentReviewModal({
  open,
  onOpenChange,
  pago,
  onApprove,
  onReject,
  isProcessing,
}: PaymentReviewModalProps) {
  const [imageZoom, setImageZoom] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Mejor detección de tipo de archivo para URLs de Firebase Storage
  const detectFileType = (url?: string) => {
    if (!url) return { isImage: false, isPDF: false };

    // Verificar extensión en la URL (antes de parámetros)
    const urlWithoutParams = url.split("?")[0];
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(urlWithoutParams);
    const isPDF = /\.pdf$/i.test(urlWithoutParams);

    // Si no detecta por extensión pero es de Firebase Storage, asumir que es imagen
    // a menos que explícitamente diga .pdf
    if (!isImage && !isPDF && url.includes("firebasestorage.googleapis.com")) {
      return { isImage: true, isPDF: false };
    }

    return { isImage, isPDF };
  };

  const { isImage, isPDF } = detectFileType(pago.comprobanteUrl);

  const handleDownload = () => {
    if (pago.comprobanteUrl) {
      window.open(pago.comprobanteUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Comprobante de Pago</DialogTitle>
          <DialogDescription>
            Revisa el comprobante y aprueba o rechaza el pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del Pago */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Pago
              </p>
              <Badge variant="outline" className="mt-1">
                {pago.tipoPago === "transferencia"
                  ? "Transferencia"
                  : "MercadoPago"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge
                className={
                  pago.estado === "pendiente"
                    ? "bg-orange-500 mt-1"
                    : pago.estado === "aprobado"
                    ? "bg-green-500 mt-1"
                    : "bg-red-500 mt-1"
                }
              >
                {pago.estado === "pendiente"
                  ? "Pendiente"
                  : pago.estado === "aprobado"
                  ? "Aprobado"
                  : "Rechazado"}
              </Badge>
            </div>
            {pago.amount && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto</p>
                <p className="text-lg font-semibold mt-1">
                  ${pago.amount.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Envío
              </p>
              <p className="text-sm mt-1">
                {format(new Date(pago.createdAt), "PPp", { locale: es })}
              </p>
            </div>
          </div>

          {/* Comprobante */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Comprobante</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>

            {pago.comprobanteUrl ? (
              <div className="relative border rounded-lg overflow-hidden bg-muted">
                {isImage && !imageError ? (
                  <div className="relative w-full">
                    <div
                      className={`relative ${
                        imageZoom ? "cursor-zoom-out" : "cursor-zoom-in"
                      }`}
                      onClick={() => setImageZoom(!imageZoom)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pago.comprobanteUrl}
                        alt="Comprobante de pago"
                        className={`w-full h-auto ${
                          imageZoom ? "max-h-none" : "max-h-96 object-contain"
                        }`}
                        onError={() => setImageError(true)}
                      />
                      {!imageZoom && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded">
                          <ZoomIn className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : isPDF ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <svg
                      className="h-16 w-16 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      Archivo PDF
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      Abrir PDF
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <svg
                      className="h-16 w-16 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      {imageError
                        ? "Error al cargar la imagen"
                        : "Formato de archivo no soportado para vista previa"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Abrir archivo
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No hay comprobante disponible
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => onReject(pago._id)}
            disabled={isProcessing || pago.estado !== "pendiente"}
            className="gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Rechazar
          </Button>
          <Button
            onClick={() => onApprove(pago._id)}
            disabled={isProcessing || pago.estado !== "pendiente"}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Aprobar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
