/**
 * Constantes y enums para Salidas Sociales
 * Este archivo puede ser importado tanto en cliente como en servidor
 */

export enum DificultadSalida {
  FACIL = "facil",
  MEDIA = "media",
  DIFICIL = "dificil",
}

export const DIFICULTAD_LABELS: Record<DificultadSalida, string> = {
  [DificultadSalida.FACIL]: "Fácil",
  [DificultadSalida.MEDIA]: "Media",
  [DificultadSalida.DIFICIL]: "Difícil",
};

export const DIFICULTAD_OPTIONS = [
  { value: DificultadSalida.FACIL, label: DIFICULTAD_LABELS[DificultadSalida.FACIL] },
  { value: DificultadSalida.MEDIA, label: DIFICULTAD_LABELS[DificultadSalida.MEDIA] },
  { value: DificultadSalida.DIFICIL, label: DIFICULTAD_LABELS[DificultadSalida.DIFICIL] },
];
