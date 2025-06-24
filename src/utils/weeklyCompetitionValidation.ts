
/**
 * VALIDAÇÕES ESPECÍFICAS PARA COMPETIÇÕES SEMANAIS (BRASÍLIA)
 * 
 * Verifica se as datas das competições semanais estão no formato correto:
 * - Início: qualquer horário do dia escolhido
 * - Fim: sempre 23:59:59 do último dia
 */

import { logger } from './logger';

export const isWeeklyCompetitionTimeValid = (startDate: string, endDate: string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar se o fim é 23:59:59
    const isValidEndTime = end.getHours() === 23 && 
                          end.getMinutes() === 59 && 
                          end.getSeconds() === 59;
    
    // Verificar se end_date é posterior ao start_date
    const isValidDateRange = end.getTime() > start.getTime();
    
    const isValid = isValidEndTime && isValidDateRange;
    
    logger.debug('Validação de competição semanal', {
      startDate,
      endDate,
      isValidEndTime,
      isValidDateRange,
      isValid
    }, 'WEEKLY_COMPETITION_VALIDATION');
    
    return isValid;
  } catch (error) {
    logger.error('Erro na validação de competição semanal', { 
      startDate, 
      endDate, 
      error 
    }, 'WEEKLY_COMPETITION_VALIDATION');
    return false;
  }
};

export const validateWeeklyCompetitionData = (competitionData: any): string[] => {
  const errors: string[] = [];
  
  if (!competitionData.start_date) {
    errors.push('Data de início é obrigatória');
  }
  
  if (!competitionData.end_date) {
    errors.push('Data de fim é obrigatória');
  }
  
  if (competitionData.start_date && competitionData.end_date) {
    if (!isWeeklyCompetitionTimeValid(competitionData.start_date, competitionData.end_date)) {
      errors.push('Competições semanais devem terminar às 23:59:59 do último dia');
    }
  }
  
  return errors;
};
