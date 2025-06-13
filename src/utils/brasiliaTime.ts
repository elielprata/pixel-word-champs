
import { logger } from './logger';

/**
 * UTILITÁRIOS DE TEMPO PARA BRASÍLIA (VERSÃO OTIMIZADA PARA PRODUÇÃO)
 */

/**
 * Obtém a data atual no formato ISO
 */
export const getCurrentDateISO = (): string => {
  const dateISO = new Date().toISOString();
  logger.debug('Data atual ISO gerada', { dateISO }, 'BRASILIA_TIME');
  return dateISO;
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

  logger.debug('Calculando status da competição', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString()
  }, 'BRASILIA_TIME');

  let status: 'scheduled' | 'active' | 'completed';
  
  if (now < start) {
    status = 'scheduled';
  } else if (now >= start && now <= end) {
    status = 'active';
  } else {
    status = 'completed';
  }

  logger.debug('Status da competição calculado', { status }, 'BRASILIA_TIME');
  return status;
};

/**
 * Formata uma data para exibição
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) {
    logger.warn('Data inválida para formatação', { dateString }, 'BRASILIA_TIME');
    return 'N/A';
  }
  
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  logger.debug('Data formatada para exibição', { 
    original: dateString, 
    formatted 
  }, 'BRASILIA_TIME');
  
  return formatted;
};

/**
 * Verifica se uma data está no horário de Brasília
 */
export const isInBrasiliaTimezone = (dateString: string): boolean => {
  const date = new Date(dateString);
  const brasiliaOffset = -3;
  const dateOffset = -date.getTimezoneOffset() / 60;
  const isInBrasilia = dateOffset === brasiliaOffset;
  
  logger.debug('Verificação de timezone Brasília', {
    dateString,
    dateOffset,
    brasiliaOffset,
    isInBrasilia
  }, 'BRASILIA_TIME');
  
  return isInBrasilia;
};

/**
 * Calcula tempo restante em segundos
 */
export const calculateTimeRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  logger.debug('Tempo restante calculado', {
    endDate,
    remainingSeconds
  }, 'BRASILIA_TIME');
  
  return remainingSeconds;
};
