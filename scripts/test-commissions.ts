/**
 * Script de validación manual de cálculos de comisiones
 * Ejecutar con: npx tsx scripts/test-commissions.ts
 */

import { calculateCommissions } from '../src/utils/commissionCalculator';

console.log('🧪 Iniciando validación de casos de prueba de comisiones\n');
console.log('='.repeat(70));

// Caso 1: 1 Alumno
console.log('\n📝 Caso 1: 1 Alumno');
const test1 = calculateCommissions(1);
console.log(`   Ingreso Bruto: $${test1.gross_income.toLocaleString()}`);
console.log(`   Ganancia Profesor: $${test1.teacher_total.toLocaleString()} ✓ (Esperado: $17,500)`);
console.log(`   Ganancia Trivo: $${test1.trivo_total.toLocaleString()}`);
console.log(`   ${test1.teacher_total === 17500 ? '✅ PASS' : '❌ FAIL'}`);

// Caso 2: 3 Alumnos
console.log('\n📝 Caso 2: 3 Alumnos');
const test2 = calculateCommissions(3);
console.log(`   Ingreso Bruto: $${test2.gross_income.toLocaleString()}`);
console.log(`   Ganancia Profesor: $${test2.teacher_total.toLocaleString()} ✓ (Esperado: $52,500)`);
console.log(`   Ganancia Trivo: $${test2.trivo_total.toLocaleString()}`);
console.log(`   ${test2.teacher_total === 52500 ? '✅ PASS' : '❌ FAIL'}`);

// Caso 3: 5 Alumnos
console.log('\n📝 Caso 3: 5 Alumnos');
const test3 = calculateCommissions(5);
console.log(`   Ingreso Bruto: $${test3.gross_income.toLocaleString()}`);
console.log(`   Ganancia Profesor: $${test3.teacher_total.toLocaleString()} ✓ (Esperado: $70,000)`);
console.log(`   Ganancia Trivo: $${test3.trivo_total.toLocaleString()}`);
console.log('   Desglose:');
console.log(`     - Alumnos 1-3 (70%): $${17500 * 3} = $52,500`);
console.log(`     - Alumnos 4-5 (35%): $${8750 * 2} = $17,500`);
console.log(`     - Total: $70,000`);
console.log(`   ${test3.teacher_total === 70000 ? '✅ PASS' : '❌ FAIL'}`);

// Caso 4: 10 Alumnos
console.log('\n📝 Caso 4: 10 Alumnos');
const test4 = calculateCommissions(10);
console.log(`   Ingreso Bruto: $${test4.gross_income.toLocaleString()}`);
console.log(`   Ganancia Profesor: $${test4.teacher_total.toLocaleString()} ✓ (Esperado: $116,250)`);
console.log(`   Ganancia Trivo: $${test4.trivo_total.toLocaleString()}`);
console.log('   Desglose:');
console.log(`     - Alumnos 1-3 (70%): $${17500 * 3} = $52,500`);
console.log(`     - Alumnos 4-5 (35%): $${8750 * 2} = $17,500`);
console.log(`     - Alumnos 6-10 (37%): $${9250 * 5} = $46,250`);
console.log(`     - Total: $116,250`);
console.log(`   ${test4.teacher_total === 116250 ? '✅ PASS' : '❌ FAIL'}`);

// Verificación de consistencia
console.log('\n📝 Verificación de Consistencia');
const testCases = [1, 5, 10, 15, 20, 25, 30];
let allPassed = true;

testCases.forEach((studentCount) => {
  const result = calculateCommissions(studentCount);
  const sum = result.teacher_total + result.trivo_total;
  const expected = result.gross_income;
  const diff = Math.abs(sum - expected);
  const passed = diff <= studentCount; // Permitir diferencia mínima por redondeo

  if (!passed) {
    allPassed = false;
    console.log(`   ❌ ${studentCount} alumnos: Suma no coincide (diff: ${diff})`);
  }
});

if (allPassed) {
  console.log('   ✅ Todas las sumas coinciden con el ingreso bruto');
}

// Verificación de tramos
console.log('\n📝 Verificación de Tramos');
const test15 = calculateCommissions(15);
console.log(`   15 Alumnos - Alumno #11 en tramo 38%: ${test15.breakdown[10].applied_rate === 0.38 ? '✅' : '❌'}`);

const test20 = calculateCommissions(20);
console.log(`   20 Alumnos - Alumno #16 en tramo 39%: ${test20.breakdown[15].applied_rate === 0.39 ? '✅' : '❌'}`);

const test25 = calculateCommissions(25);
console.log(`   25 Alumnos - Alumno #21 en tramo 40%: ${test25.breakdown[20].applied_rate === 0.40 ? '✅' : '❌'}`);

const test30 = calculateCommissions(30);
console.log(`   30 Alumnos - Alumno #26 mantiene tramo 40%: ${test30.breakdown[25].applied_rate === 0.40 ? '✅' : '❌'}`);

console.log('\n' + '='.repeat(70));
console.log('✅ Validación completa\n');
