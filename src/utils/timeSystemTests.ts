
/**
 * Testes automáticos para o sistema de tempo unificado - VERSÃO CORRIGIDA
 * Garante que Input = Preview = Exibição (Brasília), UTC apenas para storage
 * CORREÇÃO: Casos de teste atualizados para refletir conversões corretas
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
   * Executa todos os testes críticos do sistema CORRIGIDOS
   */
  public runAllTests(): TestResult[] {
    this.results = [];
    
    console.log('🧪 Iniciando bateria completa de testes CORRIGIDOS do sistema de tempo unificado...');
    
    // Testes básicos de conversão CORRIGIDOS
    this.testBasicConversionCorrected();
    this.testRoundtripConsistencyCorrected();
    this.testDurationCalculationCorrected();
    this.testValidationLimitsCorrected();
    this.testCurrentTimeFormat();
    this.testEdgeCasesCorrected();
    
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    
    console.log(`✅ Testes CORRIGIDOS concluídos: ${passedTests}/${totalTests} passaram`, {
      timestamp: getCurrentBrasiliaTime(),
      results: this.results
    });
    
    return this.results;
  }

  private testBasicConversionCorrected(): void {
    // CORREÇÃO: Casos de teste com conversões corretas
    const testCases = [
      { input: '2025-06-26T00:00', expectedUTC: '2025-06-26T03:00:00.000Z', description: 'Meia-noite Brasília' },
      { input: '2025-06-26T15:30', expectedUTC: '2025-06-26T18:30:00.000Z', description: '15:30 Brasília' },
      { input: '2025-06-26T23:00', expectedUTC: '2025-06-27T02:00:00.000Z', description: '23:00 Brasília (próximo dia UTC)' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const actual = convertBrasiliaInputToUTC(testCase.input);
        const passed = actual === testCase.expectedUTC;
        
        this.results.push({
          testName: `Conversão Básica CORRIGIDA ${index + 1}: ${testCase.description}`,
          passed,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual,
          errorMessage: !passed ? 
            `Esperado: ${testCase.expectedUTC}, Atual: ${actual}` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual,
          passed
        });
      } catch (error) {
        this.results.push({
          testName: `Conversão Básica CORRIGIDA ${index + 1}`,
          passed: false,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual: null,
          errorMessage: `Erro na conversão: ${error}`
        });
      }
    });
  }

  private testRoundtripConsistencyCorrected(): void {
    // CORREÇÃO: Casos de roundtrip que devem ser consistentes
    const testInputs = [
      '2025-06-26T08:30',
      '2025-06-26T15:45',
      '2025-06-26T23:00' // Caso crítico
    ];

    testInputs.forEach((input, index) => {
      try {
        const toUTC = convertBrasiliaInputToUTC(input);
        const backToBrasilia = formatUTCForDateTimeLocal(toUTC);
        const passed = input === backToBrasilia;
        
        this.results.push({
          testName: `Roundtrip CORRIGIDO ${index + 1}: ${input}`,
          passed,
          input,
          expected: input,
          actual: backToBrasilia,
          errorMessage: !passed ? 
            `Inconsistência no roundtrip. UTC intermediário: ${toUTC}` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} Roundtrip ${input}:`, {
          original: input,
          toUTC,
          backToBrasilia,
          consistent: passed
        });
      } catch (error) {
        this.results.push({
          testName: `Roundtrip CORRIGIDO ${index + 1}`,
          passed: false,
          input,
          expected: input,
          actual: null,
          errorMessage: `Erro no roundtrip: ${error}`
        });
      }
    });
  }

  private testDurationCalculationCorrected(): void {
    // CORREÇÃO: Casos de duração com cálculos corretos
    const testCases = [
      { start: '2025-06-26T10:00', duration: 2, expectedEnd: '2025-06-26T12:00', description: '10:00 + 2h' },
      { start: '2025-06-26T15:30', duration: 3, expectedEnd: '2025-06-26T18:30', description: '15:30 + 3h' },
      { start: '2025-06-26T21:00', duration: 2, expectedEnd: '2025-06-26T23:00', description: '21:00 + 2h (limite)' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const endUTC = calculateEndDateWithDuration(testCase.start, testCase.duration);
        const endBrasilia = formatUTCForDateTimeLocal(endUTC);
        const passed = endBrasilia === testCase.expectedEnd;
        
        this.results.push({
          testName: `Cálculo Duração CORRIGIDO ${index + 1}: ${testCase.description}`,
          passed,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: endBrasilia,
          errorMessage: !passed ? 
            `Cálculo incorreto. UTC: ${endUTC}` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          start: testCase.start,
          duration: testCase.duration,
          expected: testCase.expectedEnd,
          actual: endBrasilia,
          utc: endUTC,
          passed
        });
      } catch (error) {
        this.results.push({
          testName: `Cálculo Duração CORRIGIDO ${index + 1}`,
          passed: false,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: null,
          errorMessage: `Erro no cálculo: ${error}`
        });
      }
    });
  }

  private testValidationLimitsCorrected(): void {
    // CORREÇÃO: Casos de validação com limites corretos
    const testCases = [
      { start: '2025-06-26T22:00', duration: 4, shouldFail: true, description: '22:00 + 4h ultrapassaria 23:59' },
      { start: '2025-06-26T21:00', duration: 2, shouldFail: false, description: '21:00 + 2h = 23:00 (OK)' },
      { start: '2025-06-26T23:00', duration: 1, shouldFail: true, description: '23:00 + 1h ultrapassaria limite' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const validation = validateCompetitionDuration(testCase.start, testCase.duration);
        const passed = testCase.shouldFail ? !validation.isValid : validation.isValid;
        
        this.results.push({
          testName: `Validação Limite CORRIGIDA ${index + 1}: ${testCase.description}`,
          passed,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.shouldFail ? 'Deve falhar' : 'Deve passar',
          actual: validation.isValid ? 'Passou' : `Falhou: ${validation.error}`,
          errorMessage: !passed ? 
            `Validação incorreta para ${testCase.description}` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testCase.description}:`, {
          start: testCase.start,
          duration: testCase.duration,
          shouldFail: testCase.shouldFail,
          validationResult: validation,
          passed
        });
      } catch (error) {
        this.results.push({
          testName: `Validação Limite CORRIGIDA ${index + 1}`,
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

  private testEdgeCasesCorrected(): void {
    const edgeCases = [
      { 
        name: 'Meia-noite Brasília → UTC',
        input: '2025-06-26T00:00',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T00:00');
          const expected = '2025-06-26T03:00:00.000Z';
          return utc === expected;
        }
      },
      {
        name: 'Fim do dia Brasília → UTC',
        input: '2025-06-26T23:59',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T23:59');
          const expected = '2025-06-27T02:59:00.000Z'; // Próximo dia UTC
          return utc === expected;
        }
      },
      {
        name: 'Roundtrip crítico 23:00',
        input: '2025-06-26T23:00',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T23:00');
          const back = formatUTCForDateTimeLocal(utc);
          return '2025-06-26T23:00' === back;
        }
      },
      {
        name: 'Formatação UTC → Brasília',
        input: '2025-06-26T18:30:00.000Z',
        test: () => {
          const formatted = formatBrasiliaDate('2025-06-26T18:30:00.000Z', true);
          const expected = '26/06/2025 15:30:00'; // UTC 18:30 → Brasília 15:30
          return formatted === expected;
        }
      }
    ];

    edgeCases.forEach(edgeCase => {
      try {
        const passed = edgeCase.test();
        this.results.push({
          testName: `Edge Case CORRIGIDO: ${edgeCase.name}`,
          passed,
          input: edgeCase.input,
          expected: 'Deve funcionar corretamente',
          actual: passed ? 'Funcionou' : 'Falhou',
          errorMessage: !passed ? 
            `Edge case falhou: ${edgeCase.name}` : undefined
        });
        
        console.log(`${passed ? '✅' : '❌'} Edge case ${edgeCase.name}:`, {
          input: edgeCase.input,
          passed
        });
      } catch (error) {
        this.results.push({
          testName: `Edge Case CORRIGIDO: ${edgeCase.name}`,
          passed: false,
          input: edgeCase.input,
          expected: 'Deve funcionar corretamente',
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
  
  console.log('🧪 TESTE RÁPIDO DO SISTEMA CORRIGIDO:', {
    timestamp: getCurrentBrasiliaTime(),
    ...summary,
    detailedResults: results
  });
  
  return summary.allPassed;
};
