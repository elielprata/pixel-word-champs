
/**
 * VALIDAÇÕES ESPECÍFICAS PARA COMPETIÇÕES DIÁRIAS (BRASÍLIA)
 * 
 * Verifica se as datas das competições diárias estão no formato correto:
 * - Início: qualquer horário do dia escolhido
 * - Fim: sempre 23:59:59 do mesmo dia
 */

import { logger } from './logger';

export const isDailyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar se são do mesmo dia
    const isSameDay = start.toDateString() === end.toDateString();
    
    // Verificar se o fim é 23:59:59
    const isValidEndTime = end.getHours() === 23 && 
                          end.getMinutes() === 59 && 
                          end.getSeconds() === 59;
    
    const isValid = isSameDay && isValidEndTime;
    
    logger.debug('Validação de competição diária', {
      startDate,
      endDate,
      isSameDay,
      isValidEndTime,
      isValid
    }, 'DAILY_COMPETITION_VALIDATION');
    
    return isValid;
  } catch (error) {
    logger.error('Erro na validação de competição diária', { 
      startDate, 
      endDate, 
      error 
    }, 'DAILY_COMPETITION_VALIDATION');
    return false;
  }
};

export const validateDailyCompetitionData = (competitionData: any): string[] => {
  const errors: string[] = [];
  
  if (!competitionData.start_date) {
    errors.push('Data de início é obrigatória');
  }
  
  if (!competitionData.end_date) {
    errors.push('Data de fim é obrigatória');
  }
  
  if (competitionData.start_date && competitionData.end_date) {
    if (!isDailyCompetitionTimeValid(competitionData.start_date, competitionData.end_date)) {
      errors.push('Competições diárias devem terminar às 23:59:59 do mesmo dia');
    }
  }
  
  return errors;
};
