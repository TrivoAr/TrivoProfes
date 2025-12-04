/**
 * Sistema de Cálculo de Comisiones para Academias y Grupos de Entrenamiento
 *
 * Este sistema calcula las comisiones de forma marginal, alumno por alumno,
 * basándose en el orden de inscripción.
 */

// Precio mensual por alumno en moneda local
export const PRECIO_MENSUAL_POR_ALUMNO = 25000;

// Configuración de tramos de comisiones
export interface CommissionTier {
  minStudents: number;
  maxStudents: number;
  teacherRate: number; // Porcentaje para el profesor (0-1)
  trivoRate: number;   // Porcentaje para Trivo (0-1)
}

export const COMMISSION_TIERS: CommissionTier[] = [
  {
    minStudents: 1,
    maxStudents: 3,
    teacherRate: 0.70,
    trivoRate: 0.30,
  },
  {
    minStudents: 4,
    maxStudents: 5,
    teacherRate: 0.35,
    trivoRate: 0.65,
  },
  {
    minStudents: 6,
    maxStudents: 10,
    teacherRate: 0.37,
    trivoRate: 0.63,
  },
  {
    minStudents: 11,
    maxStudents: 15,
    teacherRate: 0.38,
    trivoRate: 0.62,
  },
  {
    minStudents: 16,
    maxStudents: 20,
    teacherRate: 0.39,
    trivoRate: 0.61,
  },
  {
    minStudents: 21,
    maxStudents: 25,
    teacherRate: 0.40,
    trivoRate: 0.60,
  },
  // Para más de 25 alumnos, se usa el último tramo
  {
    minStudents: 26,
    maxStudents: Infinity,
    teacherRate: 0.40,
    trivoRate: 0.60,
  },
];

// Desglose por alumno individual
export interface StudentBreakdown {
  student_position: number;
  teacher_cut: number;
  trivo_cut: number;
  applied_rate: number;
}

// Resultado completo del cálculo
export interface CommissionCalculation {
  total_students: number;
  gross_income: number;
  teacher_total: number;
  trivo_total: number;
  breakdown: StudentBreakdown[];
}

/**
 * Encuentra el tramo de comisión aplicable para un número de alumno específico
 * @param studentNumber - Posición del alumno (1, 2, 3, ...)
 * @returns El tramo de comisión correspondiente
 */
function getTierForStudent(studentNumber: number): CommissionTier {
  const tier = COMMISSION_TIERS.find(
    (tier) => studentNumber >= tier.minStudents && studentNumber <= tier.maxStudents
  );

  // Si no se encuentra un tramo (más de 25 alumnos), usar el último tramo
  return tier || COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
}

/**
 * Calcula las comisiones de forma marginal para un grupo
 * @param studentCount - Cantidad total de alumnos en el grupo
 * @returns Cálculo completo con desglose por alumno
 */
export function calculateCommissions(studentCount: number): CommissionCalculation {
  // Validación
  if (studentCount < 0) {
    throw new Error("La cantidad de alumnos no puede ser negativa");
  }

  if (!Number.isInteger(studentCount)) {
    throw new Error("La cantidad de alumnos debe ser un número entero");
  }

  // Inicializar resultado
  let teacherTotal = 0;
  let trivoTotal = 0;
  const breakdown: StudentBreakdown[] = [];

  // Iterar sobre cada alumno (1-indexed)
  for (let i = 1; i <= studentCount; i++) {
    const tier = getTierForStudent(i);

    const teacherCut = PRECIO_MENSUAL_POR_ALUMNO * tier.teacherRate;
    const trivoCut = PRECIO_MENSUAL_POR_ALUMNO * tier.trivoRate;

    // Acumular totales
    teacherTotal += teacherCut;
    trivoTotal += trivoCut;

    // Agregar al desglose
    breakdown.push({
      student_position: i,
      teacher_cut: Math.round(teacherCut), // Redondear a entero
      trivo_cut: Math.round(trivoCut),     // Redondear a entero
      applied_rate: tier.teacherRate,
    });
  }

  // Calcular ingreso bruto total
  const grossIncome = PRECIO_MENSUAL_POR_ALUMNO * studentCount;

  return {
    total_students: studentCount,
    gross_income: grossIncome,
    teacher_total: Math.round(teacherTotal),
    trivo_total: Math.round(trivoTotal),
    breakdown,
  };
}

/**
 * Calcula un resumen de comisiones sin el desglose detallado
 * Útil para mostrar solo los totales
 */
export function calculateCommissionSummary(studentCount: number): Omit<CommissionCalculation, 'breakdown'> {
  const fullCalculation = calculateCommissions(studentCount);
  const { breakdown, ...summary } = fullCalculation;
  return summary;
}

/**
 * Obtiene el tramo de comisión actual basado en la cantidad de alumnos
 * @param studentCount - Cantidad total de alumnos
 * @returns Información del tramo actual
 */
export function getCurrentTier(studentCount: number): CommissionTier & { tierNumber: number } {
  const tier = getTierForStudent(studentCount);
  const tierNumber = COMMISSION_TIERS.findIndex(
    (t) => t.minStudents === tier.minStudents && t.maxStudents === tier.maxStudents
  ) + 1;

  return {
    ...tier,
    tierNumber,
  };
}
