
import { ensureEndOfDay, createBrasiliaStartOfDay } from '@/utils/brasiliaTime';

/**
 * Utilitários específicos para validação de competições semanais
 */

export interface WeeklyCompetitionData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  max_participants: number;
  competition_type: 'tournament';
}

/**
 * Valida e corrige dados de competição semanal
 * GARANTE que sempre comece às 00:00:00 e termine às 23:59:59
 */
export const validateWeeklyCompetitionData = (data: Partial<WeeklyCompetitionData>): WeeklyCompetitionData => {
  console.log('🔍 Validando dados da competição semanal:', data);
  
  if (!data.title || !data.description || !data.start_date || !data.end_date) {
    throw new Error('Dados obrigatórios faltando para competição semanal');
  }

  // FORÇAR: sempre calcular horários padronizados
  const startDate = createBrasiliaStartOfDay(new Date(data.start_date)); // 00:00:00
  const endDate = ensureEndOfDay(new Date(data.end_date)); // 23:59:59
  
  console.log('✅ Horários corrigidos automaticamente:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startTime: startDate.toTimeString(),
    endTime: endDate.toTimeString()
  });

  const validatedData: WeeklyCompetitionData = {
    title: data.title,
    description: data.description,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    prize_pool: data.prize_pool || 0,
    max_participants: data.max_participants || 1000,
    competition_type: 'tournament'
  };

  return validatedData;
};

/**
 * Formata horário para exibição na UI - competições semanais
 */
export const formatWeeklyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Para competições semanais, sempre mostrar horários fixos
  const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
  
  return `${dateFormatted}, ${timeFormatted}`;
};

/**
 * Verifica se uma competição semanal está com horário correto
 */
export const isWeeklyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Verificar se início é 00:00:00 e fim é 23:59:59
  const expectedStart = createBrasiliaStartOfDay(start);
  const expectedEnd = ensureEndOfDay(end);
  
  const isStartValid = Math.abs(start.getTime() - expectedStart.getTime()) < 1000; // 1 segundo de tolerância
  const isEndValid = Math.abs(end.getTime() - expectedEnd.getTime()) < 1000;
  
  console.log('🕐 Validação de horário semanal:', {
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
