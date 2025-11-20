"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FilePenLine, Trash2, Eye, Users, Share2 } from "lucide-react";
import type { SocialOuting } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OutingTableRowProps {
  outing: SocialOuting;
  estado: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onMembers: (id: string) => void;
  onCopyLink: (outing: SocialOuting) => void;
  onDelete: (outing: SocialOuting) => void;
}

const formatFechaHora = (fecha?: string, hora?: string) => {
  if (!fecha) return "Sin fecha";
  try {
    // Parsear la fecha como local (YYYY-MM-DD) sin conversión de timezone
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    const fechaStr = format(fechaObj, "dd/MM/yyyy", { locale: es });
    return hora ? `${fechaStr} - ${hora}` : fechaStr;
  } catch {
    return "Fecha inválida";
  }
};

export const OutingTableRow = memo(function OutingTableRow({
  outing,
  estado,
  onView,
  onEdit,
  onMembers,
  onCopyLink,
  onDelete,
}: OutingTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{outing.nombre}</TableCell>
      <TableCell>{outing.deporte || "Sin especificar"}</TableCell>
      <TableCell>{formatFechaHora(outing.fecha, outing.hora)}</TableCell>
      <TableCell>
        {outing.localidad && outing.provincia
          ? `${outing.localidad}, ${outing.provincia}`
          : outing.localidad || outing.provincia || "Sin ubicación"}
      </TableCell>
      <TableCell>
        <span className={outing.participantes === outing.cupo ? "text-red-600 font-semibold" : ""}>
          {outing.participantes || 0}/{outing.cupo}
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={estado === "activa" ? "default" : "secondary"}
          className={estado === "activa" ? "bg-green-500/20 text-green-700" : ""}
        >
          {estado === "activa" ? "Activa" : "Finalizada"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(outing._id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(outing)}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMembers(outing._id)}>
              <Users className="mr-2 h-4 w-4" />
              Gestionar Miembros
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(outing._id)}>
              <FilePenLine className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(outing)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
