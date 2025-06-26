/**
 * Testes automáticos para o sistema de tempo unificado - VERSÃO DEFINITIVA CORRIGIDA
 * Garante que Input = Preview = Exibição (Brasília), UTC apenas para storage
 * CORREÇÃO DEFINITIVA: Casos de teste atualizados para parsing manual correto
 */

import { 
  convertBrasiliaInputToUTC, 
  formatBrasiliaDate, 
  getCurrentBrasiliaTime,
  formatUTCForDateTimeLocal,
  calculateEndDateWithDuration,
  validateCompetitionDuration 
} from './brasiliaTimeUnified';

export interface TestResult {
  testName: string;
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  errorMessage?: string;
}

export class TimeSystemTester {
  private results: TestResult[] = [];

  /**
   * Executa todos os testes críticos do sistema DEFINITIVOS
   */
  public runAllTests(): TestResult[] {
    this.results = [];
    
    console.log('🧪 Iniciando bateria completa de testes DEFINITIVOS do sistema de tempo unificado...');
    
    // Testes básicos de conversão DEFINITIVOS
    this.testBasicConversionDefinitive();
    this.testRoundtripConsistencyDefinitive();
    this.testDurationCalculationDefinitive();
    this.testValidationLimitsDefinitive();
    this.testCurrentTimeFormat();
    this.testEdgeCasesDefinitive();
    
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    
    console.log(`✅ Testes DEFINITIVOS concluídos: ${passedTests}/${totalTests} passaram`, {
      timestamp: getCurrentBrasiliaTime(),
      results: this.results
    });
    
    return this.results;
  }

  private testBasicConversionDefinitive(): void {
    // CORREÇÃO DEFINITIVA: Casos de teste com conversões corretas (+3h exato)
    const testCases = [
      { input: '2025-06-26T00:00', expectedUTC: '2025-06-26T03:00:00.000Z', description: 'Meia-noite Brasília → 03:00 UTC' },
      { input: '2025-06-26T15:30', expectedUTC: '2025-06-26T18:30:00.000Z', description: '15:30 Brasília → 18:30 UTC' },
      { input: '2025-06-26T23:00', expectedUTC: '2025-06-27T02:00:00.000Z', description: '23:00 Brasília → 02:00 UTC (próximo dia)' },
      { input: '2025-06-26T21:00', expectedUTC: '2025-06-27T00:00:00.000Z', description: '21:00 Brasília → 00:00 UTC (meia-noite)' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const actual = convertBrasiliaInputToUTC(testCase.input);
        const passed = actual === testCase.expectedUTC;
        
        this.results.push({
          testName: `Conversão Básica DEFINITIVA ${index + 1}: ${testCase.description}`,
          passed,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual,
          errorMessage: !passed ? 
            `Esperado: ${testCase.expectedUTC}, Atual: ${actual}. Diferença deve ser exatamente +3h` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual,
          passed,
          hourDifference: passed ? '+3h correto' : 'ERRO na diferença'
        });
      } catch (error) {
        this.results.push({
          testName: `Conversão Básica DEFINITIVA ${index + 1}`,
          passed: false,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual: null,
          errorMessage: `Erro na conversão: ${error}`
        });
      }
    });
  }

  private testRoundtripConsistencyDefinitive(): void {
    // CORREÇÃO DEFINITIVA: Casos de roundtrip que devem ser perfeitamente simétricos
    const testInputs = [
      '2025-06-26T08:30',
      '2025-06-26T15:45',
      '2025-06-26T23:00', // Caso crítico - vira próximo dia em UTC
      '2025-06-26T00:00', // Meia-noite
      '2025-06-26T12:00'  // Meio-dia
    ];

    testInputs.forEach((input, index) => {
      try {
        console.log(`🔄 Teste Roundtrip ${index + 1}: ${input}`);
        
        const toUTC = convertBrasiliaInputToUTC(input);
        console.log(`   → UTC: ${toUTC}`);
        
        const backToBrasilia = formatUTCForDateTimeLocal(toUTC);
        console.log(`   → Back: ${backToBrasilia}`);
        
        const passed = input === backToBrasilia;
        
        this.results.push({
          testName: `Roundtrip DEFINITIVO ${index + 1}: ${input}`,
          passed,
          input,
          expected: input,
          actual: backToBrasilia,
          errorMessage: !passed ? 
            `Inconsistência no roundtrip. UTC intermediário: ${toUTC}. Input deve ser igual ao output` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} Roundtrip ${input}:`, {
          original: input,
          toUTC,
          backToBrasilia,
          consistent: passed,
          symmetry: passed ? 'PERFEITA' : 'QUEBRADA'
        });
      } catch (error) {
        this.results.push({
          testName: `Roundtrip DEFINITIVO ${index + 1}`,
          passed: false,
          input,
          expected: input,
          actual: null,
          errorMessage: `Erro no roundtrip: ${error}`
        });
      }
    });
  }

  private testDurationCalculationDefinitive(): void {
    // CORREÇÃO DEFINITIVA: Casos de duração com cálculos precisos
    const testCases = [
      { start: '2025-06-26T10:00', duration: 2, expectedEnd: '2025-06-26T12:00', description: '10:00 + 2h = 12:00' },
      { start: '2025-06-26T15:30', duration: 3, expectedEnd: '2025-06-26T18:30', description: '15:30 + 3h = 18:30' },
      { start: '2025-06-26T21:00', duration: 2, expectedEnd: '2025-06-26T23:00', description: '21:00 + 2h = 23:00' },
      { start: '2025-06-26T22:00', duration: 3, expectedEnd: '2025-06-26T23:59', description: '22:00 + 3h limitado = 23:59' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const endUTC = calculateEndDateWithDuration(testCase.start, testCase.duration);
        const endBrasilia = formatUTCForDateTimeLocal(endUTC);
        
        // Para casos limitados, aceitar 23:59
        const passed = endBrasilia === testCase.expectedEnd || 
                      (testCase.expectedEnd === '2025-06-26T23:59' && endBrasilia.startsWith('2025-06-26T23:59'));
        
        this.results.push({
          testName: `Cálculo Duração DEFINITIVO ${index + 1}: ${testCase.description}`,
          passed,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: endBrasilia,
          errorMessage: !passed ? 
            `Cálculo incorreto. UTC: ${endUTC}. Deve respeitar limite 23:59` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          start: testCase.start,
          duration: testCase.duration,
          expected: testCase.expectedEnd,
          actual: endBrasilia,
          utc: endUTC,
          passed,
          calculation: 'Parsing manual + limite'
        });
      } catch (error) {
        this.results.push({
          testName: `Cálculo Duração DEFINITIVO ${index + 1}`,
          passed: false,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: null,
          errorMessage: `Erro no cálculo: ${error}`
        });
      }
    });
  }

  private testValidationLimitsDefinitive(): void {
    // CORREÇÃO DEFINITIVA: Casos de validação com limites precisos
    const testCases = [
      { start: '2025-06-26T22:00', duration: 4, shouldFail: true, description: '22:00 + 4h = 02:00 (ultrapassaria 23:59)' },
      { start: '2025-06-26T21:00', duration: 2, shouldFail: false, description: '21:00 + 2h = 23:00 (dentro do limite)' },
      { start: '2025-06-26T23:00', duration: 1, shouldFail: true, description: '23:00 + 1h = 00:00 (ultrapassaria limite)' },
      { start: '2025-06-26T20:00', duration: 3, shouldFail: false, description: '20:00 + 3h = 23:00 (exato no limite)' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const validation = validateCompetitionDuration(testCase.start, testCase.duration);
        const passed = testCase.shouldFail ? !validation.isValid : validation.isValid;
        
        this.results.push({
          testName: `Validação Limite DEFINITIVA ${index + 1}: ${testCase.description}`,
          passed,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.shouldFail ? 'Deve falhar (>23:59)' : 'Deve passar (≤23:59)',
          actual: validation.isValid ? 'Passou' : `Falhou: ${validation.error}`,
          errorMessage: !passed ? 
            `Validação incorreta para ${testCase.description}. Deve respeitar limite 23:59` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          start: testCase.start,
          duration: testCase.duration,
          shouldFail: testCase.shouldFail,
          validationResult: validation,
          passed,
          limitLogic: 'Parsing manual + validação 23:59'
        });
      } catch (error) {
        this.results.push({
          testName: `Validação Limite DEFINITIVA ${index + 1}`,
          passed: false,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.shouldFail ? 'Deve falhar' : 'Deve passar',
          actual: null,
          errorMessage: `Erro na validação: ${error}`
        });
      }
    });
  }

  private testCurrentTimeFormat(): void {
    try {
      const currentTime = getCurrentBrasiliaTime();
      const isValidFormat = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(currentTime);
      
      this.results.push({
        testName: 'Formato Horário Atual Brasília',
        passed: isValidFormat,
        input: 'getCurrentBrasiliaTime()',
        expected: 'DD/MM/YYYY HH:mm',
        actual: currentTime,
        errorMessage: !isValidFormat ? 
          'Formato de horário atual inválido' : undefined
      });
      
      console.log(`${isValidFormat ? '✅' : '❌'} Formato horário atual:`, {
        current: currentTime,
        format: 'DD/MM/YYYY HH:mm',
        valid: isValidFormat
      });
    } catch (error) {
      this.results.push({
        testName: 'Formato Horário Atual Brasília',
        passed: false,
        input: 'getCurrentBrasiliaTime()',
        expected: 'DD/MM/YYYY HH:mm',
        actual: null,
        errorMessage: `Erro ao obter horário: ${error}`
      });
    }
  }

  private testEdgeCasesDefinitive(): void {
    const edgeCases = [
      { 
        name: 'Meia-noite Brasília → UTC (parsing manual)',
        input: '2025-06-26T00:00',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T00:00');
          const expected = '2025-06-26T03:00:00.000Z';
          console.log(`   Edge case meia-noite: ${utc} vs ${expected}`);
          return utc === expected;
        }
      },
      {
        name: 'Fim do dia Brasília → UTC (parsing manual)',
        input: '2025-06-26T23:59',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T23:59');
          const expected = '2025-06-27T02:59:00.000Z'; // Próximo dia UTC
          console.log(`   Edge case fim do dia: ${utc} vs ${expected}`);
          return utc === expected;
        }
      },
      {
        name: 'Roundtrip crítico 23:00 (parsing manual)',
        input: '2025-06-26T23:00',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T23:00');
          const back = formatUTCForDateTimeLocal(utc);
          console.log(`   Edge case roundtrip 23:00: ${utc} → ${back}`);
          return '2025-06-26T23:00' === back;
        }
      },
      {
        name: 'Formatação UTC → Brasília (conversão controlada)',
        input: '2025-06-26T18:30:00.000Z',
        test: () => {
          const formatted = formatBrasiliaDate('2025-06-26T18:30:00.000Z', true);
          const expected = '26/06/2025 15:30:00'; // UTC 18:30 → Brasília 15:30
          console.log(`   Edge case formatação: ${formatted} vs ${expected}`);
          return formatted === expected;
        }
      }
    ];

    edgeCases.forEach(edgeCase => {
      try {
        console.log(`🧪 Testando edge case: ${edgeCase.name}`);
        const passed = edgeCase.test();
        this.results.push({
          testName: `Edge Case DEFINITIVO: ${edgeCase.name}`,
          passed,
          input: edgeCase.input,
          expected: 'Deve funcionar com parsing manual',
          actual: passed ? 'Funcionou perfeitamente' : 'Falhou',
          errorMessage: !passed ? 
            `Edge case falhou: ${edgeCase.name}. Parsing manual deve resolver` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} Edge case ${edgeCase.name}:`, {
          input: edgeCase.input,
          passed,
          technique: 'Parsing manual + conversão controlada'
        });
      } catch (error) {
        this.results.push({
          testName: `Edge Case DEFINITIVO: ${edgeCase.name}`,
          passed: false,
          input: edgeCase.input,
          expected: 'Deve funcionar com parsing manual',
          actual: null,
          errorMessage: `Erro no edge case: ${error}`
        });
      }
    });
  }

  /**
   * Executar teste específico por nome
   */
  public runSpecificTest(testName: string): TestResult | null {
    const allResults = this.runAllTests();
    return allResults.find(result => result.testName.includes(testName)) || null;
  }

  /**
   * Obter resumo dos testes
   */
  public getTestSummary(): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
    allPassed: boolean;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? (passed / total) * 100 : 0,
      allPassed: failed === 0 && total > 0
    };
  }
}

// Instância global para testes
export const timeSystemTester = new TimeSystemTester();

// Função de conveniência para execução rápida
export const runQuickTimeSystemTest = (): boolean => {
  const results = timeSystemTester.runAllTests();
  const summary = timeSystemTester.getTestSummary();
  
  console.log('🧪 TESTE RÁPIDO DO SISTEMA DEFINITIVO:', {
    timestamp: getCurrentBrasiliaTime(),
    ...summary,
    detailedResults: results,
    technique: 'Parsing manual + conversão controlada'
  });
  
  return summary.allPassed;
};
