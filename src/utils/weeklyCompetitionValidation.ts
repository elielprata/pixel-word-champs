
import { isValidDateString, toUTCTimestamp, formatDateForDisplay } from '@/utils/dateHelpers';
import { secureLogger } from '@/utils/secureLogger';

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
 * Validação simplificada para competições semanais
 */
export const validateWeeklyCompetitionData = (data: Partial<WeeklyCompetitionData>): WeeklyCompetitionData => {
  secureLogger.debug('Validando dados de competição semanal', { title: data.title }, 'WEEKLY_VALIDATION');
  
  if (!data.title || !data.description || !data.start_date || !data.end_date) {
    throw new Error('Dados obrigatórios faltando para competição semanal');
  }

  if (!isValidDateString(data.start_date) || !isValidDateString(data.end_date)) {
    throw new Error('Datas inválidas fornecidas');
  }

  // Converter para UTC padronizado
  const startDateUTC = toUTCTimestamp(data.start_date);
  const endDateUTC = toUTCTimestamp(data.end_date);

  const validatedData: WeeklyCompetitionData = {
    title: data.title,
    description: data.description,
    start_date: startDateUTC,
    end_date: endDateUTC,
    prize_pool: data.prize_pool || 0,
    max_participants: data.max_participants || 1000,
    competition_type: 'tournament'
  };

  secureLogger.debug('Dados validados com sucesso', { 
    title: validatedData.title,
    startDate: validatedData.start_date,
    endDate: validatedData.end_date
  }, 'WEEKLY_VALIDATION');
  
  return validatedData;
};

/**
 * Formata horário para exibição
 */
export const formatWeeklyCompetitionTime = (dateString: string, isEndDate: boolean = false): string => {
  if (!dateString) return 'N/A';
  
  return formatDateForDisplay(dateString);
};

/**
 * Verificação simplificada de datas
 */
export const isWeeklyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false;
  
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const isValid = start <= end;
  
  secureLogger.debug('Validação de datas', {
    startDate,
    endDate,
    isValid
  }, 'WEEKLY_VALIDATION');
  
  return isValid;
};

secureLogger.debug('Sistema de validação semanal simplificado carregado', undefined, 'WEEKLY_VALIDATION');
