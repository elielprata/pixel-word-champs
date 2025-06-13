
import { formatDateForDisplay } from '@/utils/brasiliaTime';
import { logger } from '@/utils/logger';

export const formatDate = (dateString: string) => {
  if (!dateString) {
    logger.warn('Data inválida para formatação', { dateString }, 'COMPETITION_UTILS');
    return 'N/A';
  }
  
  logger.debug('Formatando data', { dateString }, 'COMPETITION_UTILS');
  return formatDateForDisplay(dateString);
};

export const getWeekFromDate = (dateString: string) => {
  if (!dateString) {
    logger.warn('Data inválida para cálculo de semana', { dateString }, 'COMPETITION_UTILS');
    return 'N/A';
  }
  
  const date = new Date(dateString);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  logger.debug('Semana calculada', { dateString, weekNumber }, 'COMPETITION_UTILS');
  return weekNumber;
};

logger.info('🎯 UTILITÁRIOS DE COMPETIÇÃO SIMPLIFICADOS ATIVADOS', undefined, 'COMPETITION_UTILS');
