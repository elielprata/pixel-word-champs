
import { useState, useEffect } from 'react';
import { 
  convertBrasiliaInputToUTC, 
  formatBrasiliaDate, 
  getCurrentBrasiliaTime,
  formatUTCForDateTimeLocal,
  calculateEndDateWithDuration 
} from '@/utils/brasiliaTimeUnified';

interface ValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  timestamp: string;
}

export const useTimeSystemValidation = () => {
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(null);

  const runContinuousValidation = async () => {
    setIsValidating(true);
    const newChecks: ValidationCheck[] = [];
    const timestamp = getCurrentBrasiliaTime();

    console.log('🔍 VALIDAÇÃO FINAL COMPLETA - Iniciando...', { timestamp });

    // Check 1: Conversão crítica 23:00 Brasília → 02:00 UTC (próximo dia)
    try {
      const brasiliaTime = '2025-06-26T23:00';
      const utcTime = convertBrasiliaInputToUTC(brasiliaTime);
      const expectedUTC = '2025-06-27T02:00:00.000Z'; // Próximo dia!
      
      newChecks.push({
        name: 'Conversão Crítica 23:00 → UTC',
        status: utcTime === expectedUTC ? 'pass' : 'fail',
        message: utcTime === expectedUTC 
          ? `✅ CORRETO: ${brasiliaTime} → ${utcTime} (próximo dia UTC)`
          : `❌ ERRO: Esperado ${expectedUTC}, Atual: ${utcTime}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Conversão Crítica 23:00 → UTC',
        status: 'fail',
        message: `❌ Erro na conversão crítica: ${error}`,
        timestamp
      });
    }

    // Check 2: Conversão meio-dia 15:30 Brasília → 18:30 UTC
    try {
      const brasiliaTime = '2025-06-26T15:30';
      const utcTime = convertBrasiliaInputToUTC(brasiliaTime);
      const expectedUTC = '2025-06-26T18:30:00.000Z';
      
      newChecks.push({
        name: 'Conversão Padrão 15:30 → UTC',
        status: utcTime === expectedUTC ? 'pass' : 'fail',
        message: utcTime === expectedUTC 
          ? `✅ CORRETO: ${brasiliaTime} → ${utcTime}`
          : `❌ ERRO: Esperado ${expectedUTC}, Atual: ${utcTime}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Conversão Padrão 15:30 → UTC',
        status: 'fail',
        message: `❌ Erro na conversão padrão: ${error}`,
        timestamp
      });
    }

    // Check 3: Formatação UTC → Brasília (reverso)
    try {
      const utcTime = '2025-06-27T02:00:00.000Z'; // 23:00 Brasília
      const brasiliaDisplay = formatBrasiliaDate(utcTime, true);
      const expectedDisplay = '26/06/2025 23:00:00'; // Mesmo dia Brasília!
      
      newChecks.push({
        name: 'Formatação UTC → Brasília Display',
        status: brasiliaDisplay === expectedDisplay ? 'pass' : 'fail',
        message: brasiliaDisplay === expectedDisplay
          ? `✅ CORRETO: UTC ${utcTime} → Brasília ${brasiliaDisplay}`
          : `❌ ERRO: Esperado ${expectedDisplay}, Atual: ${brasiliaDisplay}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Formatação UTC → Brasília Display',
        status: 'fail',
        message: `❌ Erro na formatação reversa: ${error}`,
        timestamp
      });
    }

    // Check 4: Roundtrip crítico 23:00
    try {
      const originalInput = '2025-06-26T23:00';
      const toUTC = convertBrasiliaInputToUTC(originalInput);
      const backToBrasilia = formatUTCForDateTimeLocal(toUTC);
      
      newChecks.push({
        name: 'Roundtrip Crítico 23:00',
        status: originalInput === backToBrasilia ? 'pass' : 'fail',
        message: originalInput === backToBrasilia
          ? `✅ CONSISTENTE: ${originalInput} → UTC → ${backToBrasilia}`
          : `❌ PERDA: ${originalInput} → ${backToBrasilia} (via ${toUTC})`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Roundtrip Crítico 23:00',
        status: 'fail',
        message: `❌ Erro no roundtrip crítico: ${error}`,
        timestamp
      });
    }

    // Check 5: Cálculo de duração respeitando limite
    try {
      const startTime = '2025-06-26T22:00'; // 22:00
      const duration = 3; // +3h = 01:00 (próximo dia)
      const endTimeUTC = calculateEndDateWithDuration(startTime, duration);
      const endTimeBrasilia = formatUTCForDateTimeLocal(endTimeUTC);
      const expectedEnd = '2025-06-26T23:59'; // Deve limitar em 23:59
      
      const isWithinLimit = endTimeBrasilia <= expectedEnd + ':59';
      
      newChecks.push({
        name: 'Cálculo com Limite de Dia',
        status: isWithinLimit ? 'pass' : 'fail',
        message: isWithinLimit
          ? `✅ LIMITADO: ${startTime} + ${duration}h → ${endTimeBrasilia} (respeitou 23:59)`
          : `❌ ULTRAPASSOU: ${startTime} + ${duration}h → ${endTimeBrasilia}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Cálculo com Limite de Dia',
        status: 'fail',
        message: `❌ Erro no cálculo com limite: ${error}`,
        timestamp
      });
    }

    // Check 6: Horário atual Brasília válido
    try {
      const currentTime = getCurrentBrasiliaTime();
      const isValidFormat = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(currentTime);
      
      newChecks.push({
        name: 'Horário Atual Brasília',
        status: isValidFormat ? 'pass' : 'fail',
        message: isValidFormat
          ? `✅ FORMATO CORRETO: ${currentTime}`
          : `❌ FORMATO INVÁLIDO: ${currentTime}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Horário Atual Brasília',
        status: 'fail',
        message: `❌ Erro ao obter horário: ${error}`,
        timestamp
      });
    }

    // Check 7: Teste Edge Case - Meia-noite
    try {
      const midnightInput = '2025-06-26T00:00';
      const midnightUTC = convertBrasiliaInputToUTC(midnightInput);
      const expectedMidnightUTC = '2025-06-26T03:00:00.000Z';
      
      newChecks.push({
        name: 'Edge Case - Meia-noite',
        status: midnightUTC === expectedMidnightUTC ? 'pass' : 'fail',
        message: midnightUTC === expectedMidnightUTC
          ? `✅ CORRETO: Meia-noite ${midnightInput} → ${midnightUTC}`
          : `❌ ERRO: Esperado ${expectedMidnightUTC}, Atual: ${midnightUTC}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Edge Case - Meia-noite',
        status: 'fail',
        message: `❌ Erro no edge case meia-noite: ${error}`,
        timestamp
      });
    }

    setChecks(newChecks);
    
    const passedChecks = newChecks.filter(check => check.status === 'pass').length;
    const totalChecks = newChecks.length;
    const healthy = passedChecks === totalChecks;
    
    setSystemHealthy(healthy);
    setIsValidating(false);

    console.log('📊 VALIDAÇÃO FINAL CONCLUÍDA:', {
      timestamp,
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      systemHealthy: healthy,
      detailedResults: newChecks.map(c => ({
        test: c.name,
        status: c.status,
        message: c.message
      }))
    });

    return {
      healthy,
      passedChecks,
      totalChecks,
      checks: newChecks
    };
  };

  // Executar validação inicial
  useEffect(() => {
    runContinuousValidation();
  }, []);

  return {
    checks,
    isValidating,
    systemHealthy,
    runValidation: runContinuousValidation
  };
};
