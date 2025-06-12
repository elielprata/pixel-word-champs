
import { ensureEndOfDay, createBrasiliaStartOfDay } from '@/utils/brasiliaTime';

/**
 * Utilitários específicos para validação de competições diárias
 */

export interface DailyCompetitionData {
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date?: string; // Opcional pois será calculado automaticamente
  competition_type: 'challenge';
}

/**
 * Valida e corrige dados de competição diária
 * GARANTE que sempre comece às 00:00:00 e termine às 23:59:59
 */
export const validateDailyCompetitionData = (data: Partial<DailyCompetitionData>): DailyCompetitionData => {
  console.log('🔍 Validando dados da competição diária:', data);
  
  if (!data.title || !data.description || !data.theme || !data.start_date) {
    throw new Error('Dados obrigatórios faltando para competição diária');
  }

  // FORÇAR: sempre calcular horários padronizados - início 00:00:00 e fim 23:59:59
  const startDate = createBrasiliaStartOfDay(new Date(data.start_date)); // 00:00:00
  const endDate = ensureEndOfDay(startDate); // 23:59:59 do mesmo dia
  
  console.log('✅ Horários corrigidos automaticamente para competição diária:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startTime: startDate.toTimeString(),
    endTime: endDate.toTimeString()
  });

  const validatedData: DailyCompetitionData = {
    title: data.title,
    description: data.description,
    theme: data.theme,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(), // SEMPRE 23:59:59 do mesmo dia
    competition_type: 'challenge'
  };

  return validatedData;
};

/**
 * Formata horário para exibição na UI - competições diárias
 */
export const formatDailyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Para competições diárias, sempre mostrar horários fixos
  const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
  
  return `${dateFormatted}, ${timeFormatted}`;
};

/**
 * Verifica se uma competição diária está com horário correto
 */
export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificar se início é 00:00:00 e fim é 23:59:59 do mesmo dia
  const expectedStart = createBrasiliaStartOfDay(start);
  const expectedEnd = ensureEndOfDay(start); // Mesmo dia da start_date
  
  const isStartValid = Math.abs(start.getTime() - expectedStart.getTime()) < 1000; // 1 segundo de tolerância
  const isEndValid = Math.abs(end.getTime() - expectedEnd.getTime()) < 1000;
  
  console.log('🕐 Validação de horário diário:', {
    start: start.toISOString(),
    end: end.toISOString(),
    expectedStart: expectedStart.toISOString(),
    expectedEnd: expectedEnd.toISOString(),
    isStartValid,
    isEndValid,
    isValid: isStartValid && isEndValid
  });
  
  return isStartValid && isEndValid;
};
