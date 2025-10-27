/**
 * Helper functions for managing group (grupo) related data
 */

export interface TipoGrupoOption {
  value: string;
  label: string;
}

/**
 * Get the available group types based on the discipline type
 * @param tipoDisciplina - The type of discipline (Ciclismo, Running, Trekking)
 * @returns Array of group type options
 */
export function getTiposGrupoPorDisciplina(
  tipoDisciplina: string | undefined
): TipoGrupoOption[] {
  if (!tipoDisciplina) {
    return [];
  }

  switch (tipoDisciplina) {
    case "Ciclismo":
      return [
        { value: "", label: "Selecciona una disciplina" },
        { value: "Ruta", label: "Ruta" },
        { value: "MTB", label: "MTB" },
        { value: "Otros", label: "Otros" },
      ];

    case "Running":
      return [
        { value: "", label: "Selecciona una disciplina" },
        { value: "Urbano", label: "Urbano" },
        { value: "Trail", label: "Trail" },
        { value: "Marathon", label: "Marathon" },
        { value: "Otros", label: "Otros" },
      ];

    case "Trekking":
      return [
        { value: "", label: "Selecciona una disciplina" },
        { value: "de dia", label: "De día" },
        { value: "varios dias", label: "Varios días" },
        { value: "Senderismo", label: "Senderismo" },
        { value: "Ascensos", label: "Ascensos" },
        { value: "Otros", label: "Otros" },
      ];

    default:
      return [];
  }
}

/**
 * Training duration options
 */
export const DURACIONES_ENTRENAMIENTO: TipoGrupoOption[] = [
  { value: "", label: "Duración del Entrenamiento" },
  { value: "1hs", label: "1 hora" },
  { value: "2hs", label: "2 horas" },
  { value: "3hs", label: "3 horas" },
];

/**
 * Difficulty level options
 */
export const NIVELES_DIFICULTAD: TipoGrupoOption[] = [
  { value: "", label: "Selecciona dificultad" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];
