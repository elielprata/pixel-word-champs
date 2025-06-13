
import { logger } from '@/utils/logger';

/**
 * Utilitários para verificação de tempo das competições (VERSÃO SIMPLIFICADA)
 * Removidas as conversões complexas de timezone - agora trabalha com datas simples
 */

/**
 * Ajusta o horário de fim da competição para 23:59:59 (VERSÃO SIMPLIFICADA)
 */
export const adjustCompetitionEndTime = (startDate: Date): Date => {
  logger.debug('Ajustando horário de fim da competição', { startDate }, 'COMPETITION_TIME_UTILS');
  
  const correctedEndDate = new Date(startDate);
  correctedEndDate.setHours(23, 59, 59, 999);
  
  logger.debug('Horário ajustado', { 
    original: startDate,
    adjusted: correctedEndDate 
  }, 'COMPETITION_TIME_UTILS');
  
  return correctedEndDate;
};

/**
 * Verifica se uma competição está ativa (VERSÃO SIMPLIFICADA)
 */
export const isCompetitionActive = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  
  logger.debug('Verificando se competição está ativa', {
    startDate,
    endDate,
    now,
    isActive
  }, 'COMPETITION_TIME_UTILS');
  
  return isActive;
};

/**
 * Log de verificação de competição (VERSÃO SIMPLIFICADA)
 */
export const logCompetitionVerification = (comp: any, isActive: boolean, now: Date) => {
  logger.info(`Verificando competição "${comp.title}" (SIMPLES)`, {
    id: comp.id,
    start: new Date(comp.start_date).toISOString(),
    end: new Date(comp.end_date).toISOString(),
    now: now.toISOString(),
    isActive: isActive,
    startTime: new Date(comp.start_date).getTime(),
    endTime: new Date(comp.end_date).getTime(),
    currentTime: now.getTime()
  }, 'COMPETITION_TIME_UTILS');
};
