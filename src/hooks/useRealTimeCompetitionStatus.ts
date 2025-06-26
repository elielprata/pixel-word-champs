
import { useState, useEffect, useCallback } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';

/**
 * Hook para status de competição em tempo real
 * CORRIGIDO: Agora usa conversão correta de timezone para cálculos
 */
export const useRealTimeCompetitionStatus = (competitions: any[]) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // CORRIGIDO: Função para calcular status em tempo real sem double conversion
  const calculateRealTimeStatus = useCallback((startDate: string, endDate: string) => {
    // CORREÇÃO: Usar a mesma lógica corrigida do serviço
    const now = new Date();
    const startUTC = new Date(startDate);
    const endUTC = new Date(endDate);

    logger.debug('Calculando status em tempo real (CORRIGIDO)', {
      nowUTC: now.toISOString(),
      startUTC: startUTC.toISOString(),
      endUTC: endUTC.toISOString(),
      nowBrasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      startBrasilia: startUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      endBrasilia: endUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      comparison: {
        isBefore: now < startUTC,
        isDuring: now >= startUTC && now <= endUTC,
        isAfter: now > endUTC
      }
    }, 'REAL_TIME_STATUS');

    // CORREÇÃO: Comparação direta de objetos Date
    if (now < startUTC) {
      return 'scheduled';
    } else if (now >= startUTC && now <= endUTC) {
      return 'active';
    } else {
      return 'completed';
    }
  }, []);

  // CORRIGIDO: Função para calcular tempo restante em segundos
  const calculateTimeRemaining = useCallback((endDate: string) => {
    const now = new Date();
    const endUTC = new Date(endDate);
    
    const diff = endUTC.getTime() - now.getTime();
    
    logger.debug('Calculando tempo restante (CORRIGIDO)', {
      nowUTC: now.toISOString(),
      endUTC: endUTC.toISOString(),
      nowBrasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      endBrasilia: endUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
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
        timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
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
