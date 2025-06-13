
/**
 * UTILITÁRIOS DE TEMPO PARA BRASÍLIA (VERSÃO OTIMIZADA PARA PRODUÇÃO)
 */

import { logger } from './logger';

/**
 * Obtém a data atual no formato ISO
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Calcula o status correto de uma competição baseado nas datas
 */
export const calculateCompetitionStatus = (
  startDate: string, 
  endDate: string
): 'scheduled' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  logger.debug('calculateCompetitionStatus', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString()
  });

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Formata uma data para exibição
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Verifica se uma data está no horário de Brasília
 */
export const isInBrasiliaTimezone = (dateString: string): boolean => {
  const date = new Date(dateString);
  const brasiliaOffset = -3;
  const dateOffset = -date.getTimezoneOffset() / 60;
  
  return dateOffset === brasiliaOffset;
};

/**
 * Calcula tempo restante em segundos
 */
export const calculateTimeRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  logger.debug('calculateTimeRemaining', {
    endDate,
    remainingSeconds
  });
  
  return remainingSeconds;
};
