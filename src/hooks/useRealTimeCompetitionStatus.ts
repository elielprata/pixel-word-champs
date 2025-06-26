
import { useState, useEffect, useCallback } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';

/**
 * Hook para status de competição em tempo real
 * Atualiza automaticamente baseado na data/hora atual
 */
export const useRealTimeCompetitionStatus = (competitions: any[]) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para calcular status em tempo real
  const calculateRealTimeStatus = useCallback((startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'scheduled';
    } else if (now >= start && now <= end) {
      return 'active';
    } else {
      return 'completed';
    }
  }, []);

  // Função para calcular tempo restante em segundos
  const calculateTimeRemaining = useCallback((endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
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
    return competitions.map(comp => ({
      ...comp,
      calculatedStatus: calculateRealTimeStatus(comp.start_date, comp.end_date),
      timeRemaining: calculateTimeRemaining(comp.end_date),
      isStatusOutdated: comp.status !== calculateRealTimeStatus(comp.start_date, comp.end_date)
    }));
  }, [competitions, calculateRealTimeStatus, calculateTimeRemaining]);

  // Atualização a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
      logger.debug('Status tempo real atualizado', { timestamp: new Date().toISOString() }, 'REAL_TIME_STATUS');
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
