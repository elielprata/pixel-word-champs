
/**
 * Testes automáticos para o sistema de tempo unificado
 * Garante que Input = Preview = Exibição (Brasília), UTC apenas para storage
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
   * Executa todos os testes críticos do sistema
   */
  public runAllTests(): TestResult[] {
    this.results = [];
    
    console.log('🧪 Iniciando bateria completa de testes do sistema de tempo unificado...');
    
    // Testes básicos de conversão
    this.testBasicConversion();
    this.testRoundtripConsistency();
    this.testDurationCalculation();
    this.testValidationLimits();
    this.testCurrentTimeFormat();
    this.testEdgeCases();
    
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;
    
    console.log(`✅ Testes concluídos: ${passedTests}/${totalTests} passaram`, {
      timestamp: getCurrentBrasiliaTime(),
      results: this.results
    });
    
    return this.results;
  }

  private testBasicConversion(): void {
    const testCases = [
      { input: '2025-06-26T00:00', expectedUTC: '2025-06-26T03:00:00.000Z' },
      { input: '2025-06-26T12:00', expectedUTC: '2025-06-26T15:00:00.000Z' },
      { input: '2025-06-26T23:59', expectedUTC: '2025-06-27T02:59:00.000Z' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const actual = convertBrasiliaInputToUTC(testCase.input);
        this.results.push({
          testName: `Conversão Básica ${index + 1}: ${testCase.input}`,
          passed: actual === testCase.expectedUTC,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual,
          errorMessage: actual !== testCase.expectedUTC ? 
            `Conversão incorreta: deveria adicionar +3h` : undefined
        });
      } catch (error) {
        this.results.push({
          testName: `Conversão Básica ${index + 1}`,
          passed: false,
          input: testCase.input,
          expected: testCase.expectedUTC,
          actual: null,
          errorMessage: `Erro na conversão: ${error}`
        });
      }
    });
  }

  private testRoundtripConsistency(): void {
    const testInputs = [
      '2025-06-26T08:30',
      '2025-06-26T15:45',
      '2025-06-26T22:15'
    ];

    testInputs.forEach((input, index) => {
      try {
        const toUTC = convertBrasiliaInputToUTC(input);
        const backToBrasilia = formatUTCForDateTimeLocal(toUTC);
        
        this.results.push({
          testName: `Roundtrip ${index + 1}: ${input}`,
          passed: input === backToBrasilia,
          input,
          expected: input,
          actual: backToBrasilia,
          errorMessage: input !== backToBrasilia ? 
            `Perda de consistência no roundtrip` : undefined
        });
      } catch (error) {
        this.results.push({
          testName: `Roundtrip ${index + 1}`,
          passed: false,
          input,
          expected: input,
          actual: null,
          errorMessage: `Erro no roundtrip: ${error}`
        });
      }
    });
  }

  private testDurationCalculation(): void {
    const testCases = [
      { start: '2025-06-26T10:00', duration: 2, expectedEnd: '2025-06-26T12:00' },
      { start: '2025-06-26T15:30', duration: 3, expectedEnd: '2025-06-26T18:30' },
      { start: '2025-06-26T20:00', duration: 3, expectedEnd: '2025-06-26T23:00' }
    ];

    testCases.forEach((testCase, index) => {
      try {
        const endUTC = calculateEndDateWithDuration(testCase.start, testCase.duration);
        const endBrasilia = formatUTCForDateTimeLocal(endUTC);
        
        this.results.push({
          testName: `Cálculo Duração ${index + 1}`,
          passed: endBrasilia === testCase.expectedEnd,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: endBrasilia,
          errorMessage: endBrasilia !== testCase.expectedEnd ? 
            `Cálculo de duração incorreto` : undefined
        });
      } catch (error) {
        this.results.push({
          testName: `Cálculo Duração ${index + 1}`,
          passed: false,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.expectedEnd,
          actual: null,
          errorMessage: `Erro no cálculo: ${error}`
        });
      }
    });
  }

  private testValidationLimits(): void {
    const testCases = [
      { start: '2025-06-26T22:00', duration: 4, shouldFail: true }, // Ultrapassaria limite
      { start: '2025-06-26T21:00', duration: 2, shouldFail: false }, // Dentro do limite
      { start: '2025-06-26T23:00', duration: 1, shouldFail: true }   // No limite
    ];

    testCases.forEach((testCase, index) => {
      try {
        const validation = validateCompetitionDuration(testCase.start, testCase.duration);
        const passed = testCase.shouldFail ? !validation.isValid : validation.isValid;
        
        this.results.push({
          testName: `Validação Limite ${index + 1}`,
          passed,
          input: `${testCase.start} + ${testCase.duration}h`,
          expected: testCase.shouldFail ? 'Deve falhar' : 'Deve passar',
          actual: validation.isValid ? 'Passou' : `Falhou: ${validation.error}`,
          errorMessage: !passed ? 
            `Validação de limite incorreta` : undefined
        });
      } catch (error) {
        this.results.push({
          testName: `Validação Limite ${index + 1}`,
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
        testName: 'Formato Horário Atual',
        passed: isValidFormat,
        input: 'getCurrentBrasiliaTime()',
        expected: 'DD/MM/YYYY HH:mm',
        actual: currentTime,
        errorMessage: !isValidFormat ? 
          'Formato de horário atual inválido' : undefined
      });
    } catch (error) {
      this.results.push({
        testName: 'Formato Horário Atual',
        passed: false,
        input: 'getCurrentBrasiliaTime()',
        expected: 'DD/MM/YYYY HH:mm',
        actual: null,
        errorMessage: `Erro ao obter horário: ${error}`
      });
    }
  }

  private testEdgeCases(): void {
    const edgeCases = [
      { 
        name: 'Meia-noite',
        input: '2025-06-26T00:00',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T00:00');
          const back = formatUTCForDateTimeLocal(utc);
          return '2025-06-26T00:00' === back;
        }
      },
      {
        name: 'Fim do dia',
        input: '2025-06-26T23:59',
        test: () => {
          const utc = convertBrasiliaInputToUTC('2025-06-26T23:59');
          const back = formatUTCForDateTimeLocal(utc);
          return '2025-06-26T23:59' === back;
        }
      },
      {
        name: 'Formatação UTC',
        input: '2025-06-26T18:30:00.000Z',
        test: () => {
          const formatted = formatBrasiliaDate('2025-06-26T18:30:00.000Z', true);
          return formatted === '26/06/2025 15:30:00';
        }
      }
    ];

    edgeCases.forEach(edgeCase => {
      try {
        const passed = edgeCase.test();
        this.results.push({
          testName: `Edge Case: ${edgeCase.name}`,
          passed,
          input: edgeCase.input,
          expected: 'Deve funcionar corretamente',
          actual: passed ? 'Funcionou' : 'Falhou',
          errorMessage: !passed ? 
            `Edge case falhou: ${edgeCase.name}` : undefined
        });
      } catch (error) {
        this.results.push({
          testName: `Edge Case: ${edgeCase.name}`,
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
  
  console.log('🧪 TESTE RÁPIDO DO SISTEMA:', {
    timestamp: getCurrentBrasiliaTime(),
    ...summary,
    detailedResults: results
  });
  
  return summary.allPassed;
};
