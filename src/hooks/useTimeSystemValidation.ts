
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

    console.log('🔍 Iniciando validação contínua do sistema de tempo...', { timestamp });

    // Check 1: Conversão básica Brasília → UTC
    try {
      const brasiliaTime = '2025-06-26T15:30';
      const utcTime = convertBrasiliaInputToUTC(brasiliaTime);
      const expectedUTC = '2025-06-26T18:30:00.000Z';
      
      newChecks.push({
        name: 'Conversão Brasília → UTC',
        status: utcTime === expectedUTC ? 'pass' : 'fail',
        message: utcTime === expectedUTC 
          ? `✅ Conversão correta: ${brasiliaTime} → ${utcTime}`
          : `❌ Esperado: ${expectedUTC}, Atual: ${utcTime}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Conversão Brasília → UTC',
        status: 'fail',
        message: `❌ Erro na conversão: ${error}`,
        timestamp
      });
    }

    // Check 2: Formatação UTC → Brasília
    try {
      const utcTime = '2025-06-26T18:30:00.000Z';
      const brasiliaDisplay = formatBrasiliaDate(utcTime, true);
      const expectedDisplay = '26/06/2025 15:30:00';
      
      newChecks.push({
        name: 'Formatação UTC → Brasília',
        status: brasiliaDisplay === expectedDisplay ? 'pass' : 'fail',
        message: brasiliaDisplay === expectedDisplay
          ? `✅ Formatação correta: ${utcTime} → ${brasiliaDisplay}`
          : `❌ Esperado: ${expectedDisplay}, Atual: ${brasiliaDisplay}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Formatação UTC → Brasília',
        status: 'fail',
        message: `❌ Erro na formatação: ${error}`,
        timestamp
      });
    }

    // Check 3: Roundtrip consistency
    try {
      const originalInput = '2025-06-26T15:30';
      const toUTC = convertBrasiliaInputToUTC(originalInput);
      const backToBrasilia = formatUTCForDateTimeLocal(toUTC);
      
      newChecks.push({
        name: 'Consistência Roundtrip',
        status: originalInput === backToBrasilia ? 'pass' : 'fail',
        message: originalInput === backToBrasilia
          ? `✅ Roundtrip consistente: ${originalInput} → UTC → ${backToBrasilia}`
          : `❌ Perda de dados: ${originalInput} → ${backToBrasilia}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Consistência Roundtrip',
        status: 'fail',
        message: `❌ Erro no roundtrip: ${error}`,
        timestamp
      });
    }

    // Check 4: Cálculo de duração
    try {
      const startTime = '2025-06-26T15:30';
      const duration = 2;
      const endTimeUTC = calculateEndDateWithDuration(startTime, duration);
      const endTimeBrasilia = formatUTCForDateTimeLocal(endTimeUTC);
      const expectedEnd = '2025-06-26T17:30';
      
      newChecks.push({
        name: 'Cálculo de Duração',
        status: endTimeBrasilia === expectedEnd ? 'pass' : 'fail',
        message: endTimeBrasilia === expectedEnd
          ? `✅ Duração calculada corretamente: ${startTime} + ${duration}h → ${endTimeBrasilia}`
          : `❌ Esperado: ${expectedEnd}, Atual: ${endTimeBrasilia}`,
        timestamp
      });
    } catch (error) {
      newChecks.push({
        name: 'Cálculo de Duração',
        status: 'fail',
        message: `❌ Erro no cálculo: ${error}`,
        timestamp
      });
    }

    // Check 5: Horário atual válido
    try {
      const currentTime = getCurrentBrasiliaTime();
      const isValidFormat = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(currentTime);
      
      newChecks.push({
        name: 'Horário Atual Brasília',
        status: isValidFormat ? 'pass' : 'fail',
        message: isValidFormat
          ? `✅ Formato correto: ${currentTime}`
          : `❌ Formato inválido: ${currentTime}`,
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

    setChecks(newChecks);
    
    const passedChecks = newChecks.filter(check => check.status === 'pass').length;
    const totalChecks = newChecks.length;
    const healthy = passedChecks === totalChecks;
    
    setSystemHealthy(healthy);
    setIsValidating(false);

    console.log('📊 Validação concluída:', {
      timestamp,
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      systemHealthy: healthy,
      checks: newChecks
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
