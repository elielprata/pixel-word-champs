
import { useState, useEffect, useCallback } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

/**
 * Hook para status de competição em tempo real
 * Atualiza automaticamente baseado na data/hora atual em Brasília
 */
export const useRealTimeCompetitionStatus = (competitions: any[]) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para calcular status em tempo real usando timezone de Brasília
  const calculateRealTimeStatus = useCallback((startDate: string, endDate: string) => {
    // Usar timezone de Brasília para todos os cálculos
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const start = new Date(startDate);
    const end = new Date(endDate);

    logger.debug('Calculando status em tempo real', {
      now: formatBrasiliaDate(brasiliaTime),
      startDate: formatBrasiliaDate(start),
      endDate: formatBrasiliaDate(end),
      nowUTC: now.toISOString(),
      startUTC: start.toISOString(),
      endUTC: end.toISOString()
    }, 'REAL_TIME_STATUS');

    if (brasiliaTime < start) {
      return 'scheduled';
    } else if (brasiliaTime >= start && brasiliaTime <= end) {
      return 'active';
    } else {
      return 'completed';
    }
  }, []);

  // Função para calcular tempo restante em segundos
  const calculateTimeRemaining = useCallback((endDate: string) => {
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const end = new Date(endDate);
    const diff = end.getTime() - brasiliaTime.getTime();
    
    logger.debug('Calculando tempo restante', {
      brasiliaTime: formatBrasiliaDate(brasiliaTime),
      endDate: formatBrasiliaDate(end),
      diffMs: diff,
      diffSeconds: Math.floor(diff / 1000)
    }, 'REAL_TIME_STATUS');
    
    return Math.max(0, Math.floor(diff / 1000));
  }, []);

  // Função para verificar se precisa atualizar o banco
  const checkAndUpdateDatabase = useCallback(async () => {
    try {
      logger.debug('Verificando atualizações necessárias no banco', undefined, 'REAL_TIME_STATUS');
      await competitionTimeService.updateCompetitionStatuses();
    } catch (error) {
      logger.error('Erro ao atualizar status no banco', { error }, 'REAL_TIME_STATUS');
    }
  }, []);

  // Mapear competições com status em tempo real
  const competitionsWithRealTimeStatus = useCallback(() => {
    return competitions.map(comp => {
      const calculatedStatus = calculateRealTimeStatus(comp.start_date, comp.end_date);
      const timeRemaining = calculateTimeRemaining(comp.end_date);
      const isStatusOutdated = comp.status !== calculatedStatus;
      
      // Log de inconsistências para debug
      if (isStatusOutdated) {
        logger.warn('Status inconsistente detectado', {
          competitionId: comp.id,
          title: comp.title,
          databaseStatus: comp.status,
          calculatedStatus: calculatedStatus,
          startDate: comp.start_date,
          endDate: comp.end_date,
          timeRemaining: timeRemaining
        }, 'REAL_TIME_STATUS');
      }
      
      return {
        ...comp,
        calculatedStatus,
        timeRemaining,
        isStatusOutdated
      };
    });
  }, [competitions, calculateRealTimeStatus, calculateTimeRemaining]);

  // Atualização a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      logger.debug('Status tempo real atualizado', { 
        timestamp: formatBrasiliaDate(new Date())
      }, 'REAL_TIME_STATUS');
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Atualização do banco a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateDatabase();
    }, 120000); // 2 minutos

    // Primeira verificação imediata
    checkAndUpdateDatabase();

    return () => clearInterval(interval);
  }, [checkAndUpdateDatabase]);

  // Atualizar quando a página fica visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setLastUpdate(Date.now());
        checkAndUpdateDatabase();
        logger.debug('Página visível - status atualizado', undefined, 'REAL_TIME_STATUS');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAndUpdateDatabase]);

  return {
    competitions: competitionsWithRealTimeStatus(),
    lastUpdate,
    calculateRealTimeStatus,
    calculateTimeRemaining,
    refreshStatus: () => setLastUpdate(Date.now())
  };
};
