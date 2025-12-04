# Sistema de Cálculo de Comisiones - Trivo

## Descripción General

El sistema de comisiones de Trivo calcula de forma **marginal** (alumno por alumno) las ganancias del profesor y la plataforma, basándose en el orden de inscripción de los alumnos.

**Importante:** Este sistema aplica SOLO para Academias y Grupos de Entrenamiento, NO para el Club del Trekking.

## Lógica de Negocio

### Precio Base
- **$25,000** por alumno por mes (moneda local)

### Estructura de Comisiones por Tramos

El cálculo NO es un porcentaje fijo sobre el total, sino que se aplica **alumno por alumno** según su posición de inscripción:

| Rango de Alumnos | % Profesor | % Trivo | Ganancia Profesor por Alumno |
|------------------|------------|---------|-------------------------------|
| 1-3              | 70%        | 30%     | $17,500                       |
| 4-5              | 35%        | 65%     | $8,750                        |
| 6-10             | 37%        | 63%     | $9,250                        |
| 11-15            | 38%        | 62%     | $9,500                        |
| 16-20            | 39%        | 61%     | $9,750                        |
| 21-25            | 40%        | 60%     | $10,000                       |
| 26+              | 40%        | 60%     | $10,000                       |

### Ejemplos de Cálculo

#### Ejemplo 1: 1 Alumno
- **Alumno #1:** $25,000 × 70% = $17,500
- **Total Profesor:** $17,500
- **Total Trivo:** $7,500

#### Ejemplo 2: 5 Alumnos
- **Alumnos 1-3:** 3 × $17,500 = $52,500
- **Alumnos 4-5:** 2 × $8,750 = $17,500
- **Total Profesor:** $70,000
- **Total Trivo:** $55,000

#### Ejemplo 3: 10 Alumnos
- **Alumnos 1-3:** 3 × $17,500 = $52,500
- **Alumnos 4-5:** 2 × $8,750 = $17,500
- **Alumnos 6-10:** 5 × $9,250 = $46,250
- **Total Profesor:** $116,250
- **Total Trivo:** $133,750

## Implementación Técnica

### Estructura de Archivos

```
src/
├── utils/
│   └── commissionCalculator.ts          # Lógica de cálculo pura
├── app/api/comisiones/
│   ├── grupo/[id]/route.ts              # API: Comisiones de un grupo específico
│   ├── profesor/route.ts                # API: Comisiones de un profesor
│   └── admin/route.ts                   # API: Vista completa para admins
└── components/comisiones/
    ├── CommissionSimulator.tsx          # Simulador interactivo
    ├── TeacherCommissions.tsx           # Vista para profesores
    └── AdminCommissions.tsx             # Vista para administradores
```

### API Endpoints

#### 1. GET `/api/comisiones/grupo/[id]`
Obtiene las comisiones de un grupo específico.

**Permisos:** Profesor del grupo, Dueño de academia, o Admin

**Respuesta:**
```json
{
  "grupo": {
    "_id": "...",
    "nombre_grupo": "Grupo Running Avanzado",
    "nivel": "Avanzado",
    "horario": "18:00 - 19:30",
    "dias": ["Lun", "Mie", "Vie"]
  },
  "academia": {
    "_id": "...",
    "nombre_academia": "Academia Runners Pro"
  },
  "comisiones": {
    "total_students": 10,
    "gross_income": 250000,
    "teacher_total": 116250,
    "trivo_total": 133750,
    "breakdown": [...]
  }
}
```

#### 2. GET `/api/comisiones/profesor`
Obtiene todas las comisiones de los grupos de un profesor.

**Permisos:** Profesor (solo sus grupos) o Dueño de Academia

**Respuesta:**
```json
{
  "profesor": {
    "id": "...",
    "nombre": "Juan Pérez"
  },
  "totales": {
    "totalStudents": 25,
    "totalIncome": 250000,
    "totalGroups": 3
  },
  "grupos": [...]
}
```

#### 3. GET `/api/comisiones/admin`
Vista completa de todas las comisiones de la plataforma.

**Permisos:** Solo Administradores

**Respuesta:**
```json
{
  "totalesPlataforma": {
    "totalAcademias": 10,
    "totalGrupos": 45,
    "totalStudents": 350,
    "grossIncome": 8750000,
    "teacherTotal": 3500000,
    "trivoTotal": 5250000
  },
  "academias": [...]
}
```

### Componentes React

#### CommissionSimulator
Simulador interactivo para que los profesores puedan calcular ganancias potenciales.

```tsx
import { CommissionSimulator } from '@/components/comisiones/CommissionSimulator';

<CommissionSimulator />
```

#### TeacherCommissions
Muestra las comisiones reales de todos los grupos del profesor.

```tsx
import { TeacherCommissions } from '@/components/comisiones/TeacherCommissions';

<TeacherCommissions />
```

#### AdminCommissions
Vista administrativa completa con desglose por academia y grupo.

```tsx
import { AdminCommissions } from '@/components/comisiones/AdminCommissions';

<AdminCommissions />
```

## Funciones Utilitarias

### calculateCommissions(studentCount: number)
Calcula las comisiones completas con desglose detallado.

```typescript
import { calculateCommissions } from '@/utils/commissionCalculator';

const result = calculateCommissions(10);
console.log(result.teacher_total); // 116250
console.log(result.breakdown); // Array con desglose por alumno
```

### calculateCommissionSummary(studentCount: number)
Calcula solo los totales sin el desglose (más eficiente).

```typescript
import { calculateCommissionSummary } from '@/utils/commissionCalculator';

const summary = calculateCommissionSummary(10);
console.log(summary.teacher_total); // 116250
// No incluye 'breakdown'
```

### getCurrentTier(studentCount: number)
Obtiene el tramo actual según la cantidad de alumnos.

```typescript
import { getCurrentTier } from '@/utils/commissionCalculator';

const tier = getCurrentTier(10);
console.log(tier.teacherRate); // 0.37
console.log(tier.tierNumber); // 3
```

## Privacidad y Permisos

### Vista de Profesor
- **Puede ver:** Sus propias ganancias totales y por grupo
- **NO puede ver:** Las ganancias de Trivo

### Vista de Dueño de Academia
- **Puede ver:** Comisiones de todos los grupos de su academia
- **NO puede ver:** Las ganancias de Trivo

### Vista de Administrador
- **Puede ver:** Todo el sistema completo
  - Ganancias de profesores
  - Ganancias de Trivo
  - Desglose por academia, grupo y alumno

## Validación

El sistema ha sido validado con los siguientes casos de prueba:

✅ 1 Alumno → Profesor gana $17,500
✅ 3 Alumnos → Profesor gana $52,500
✅ 5 Alumnos → Profesor gana $70,000
✅ 10 Alumnos → Profesor gana $116,250

Para ejecutar la validación manual:

```bash
npx tsx scripts/test-commissions.ts
```

## Integración en Dashboard

### Dashboard de Profesores
El componente `TeacherCommissions` se integra automáticamente en:
- `/dashboard` para usuarios con rol `profe`
- `/dashboard` para usuarios con rol `dueñoAcademia`

### Dashboard de Administradores
El componente `AdminCommissions` se integra automáticamente en:
- `/dashboard` para usuarios con rol `admin`

**Estadísticas de Revenue:**
Las comisiones de academias se reflejan automáticamente en las estadísticas del dashboard de admin:
- **Ingresos Totales:** Suma de Salidas/Club + Academias (Bruto)
- **Comisiones Trivo:** Porcentaje que retiene la plataforma de academias
- **Comisiones Profesores:** Porcentaje que reciben los profesores
- **Alumnos en Academias:** Total de alumnos activos en todos los grupos
- **Grupos Activos:** Total de grupos con al menos 1 alumno activo

Todos los datos son calculados dinámicamente desde la base de datos, sin valores hardcodeados.

## Notas Importantes

1. **Exclusión del Club del Trekking:** Este sistema NO aplica para las salidas del Club del Trekking, que tiene su propio sistema de suscripción mensual.

2. **Cálculo Marginal:** Es fundamental entender que el cálculo es marginal (alumno por alumno), no un porcentaje plano sobre el total.

3. **Alumnos Activos:** Solo se cuentan los miembros con estado `activo` en la base de datos.

4. **Escalabilidad:** El sistema está diseñado para soportar más de 25 alumnos por grupo, manteniendo el último tramo de comisión (40%).

## Futuras Mejoras

- [ ] Agregar histórico de comisiones mensuales
- [ ] Implementar reportes descargables en PDF
- [ ] Sistema de notificaciones al alcanzar nuevos tramos
- [ ] Dashboard de proyecciones de ingresos
- [ ] Integración con sistema de pagos automáticos
