
/**
 * Utilitários para verificação de tempo das competições (BRASÍLIA UNIFICADO)
 * Todas as operações agora trabalham exclusivamente com horário de Brasília
 */

import { getCurrentBrasiliaDate, isCompetitionActive, calculateCompetitionStatus } from './brasiliaTimeUnified';

/**
 * Ajusta o horário de fim da competição para 23:59:59 (BRASÍLIA)
 */
export const adjustCompetitionEndTime = (startDate: Date): Date => {
  const correctedEndDate = new Date(startDate);
  correctedEndDate.setHours(23, 59, 59, 999);
  return correctedEndDate;
};

/**
 * Log de verificação de competição (BRASÍLIA)
 */
export const logCompetitionVerification = (comp: any, isActive: boolean, now: Date) => {
  console.log(`🔍 Verificando competição "${comp.title}" (BRASÍLIA):`, {
    id: comp.id,
    start: new Date(comp.start_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    end: new Date(comp.end_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    now: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    isActive: isActive,
    timezone: 'America/Sao_Paulo'
  });
};

// Re-exportar funções unificadas
export { isCompetitionActive, calculateCompetitionStatus };
