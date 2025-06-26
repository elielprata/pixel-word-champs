
import { useState, useEffect, useCallback } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

/**
 * Hook para status de competição em tempo real
 * CORREÇÃO: Agora usa conversão correta de timezone para cálculos
 */
export const useRealTimeCompetitionStatus = (competitions: any[]) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para calcular status em tempo real usando timezone de Brasília CORRIGIDO
  const calculateRealTimeStatus = useCallback((startDate: string, endDate: string) => {
    // Usar timezone de Brasília para todos os cálculos
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    // CORREÇÃO CRÍTICA: Converter datas UTC do banco para Brasília
    const startUTC = new Date(startDate);
    const endUTC = new Date(endDate);
    const startBrasilia = new Date(startUTC.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const endBrasilia = new Date(endUTC.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

    logger.debug('Calculando status em tempo real (CORRIGIDO)', {
      brasiliaTime: formatBrasiliaDate(brasiliaTime),
      startDateUTC: startUTC.toISOString(),
      endDateUTC: endUTC.toISOString(),
      startDateBrasilia: formatBrasiliaDate(startBrasilia),
      endDateBrasilia: formatBrasiliaDate(endBrasilia),
      comparison: {
        isBefore: brasiliaTime < startBrasilia,
        isDuring: brasiliaTime >= startBrasilia && brasiliaTime <= endBrasilia,
        isAfter: brasiliaTime > endBrasilia
      }
    }, 'REAL_TIME_STATUS');

    if (brasiliaTime < startBrasilia) {
      return 'scheduled';
    } else if (brasiliaTime >= startBrasilia && brasiliaTime <= endBrasilia) {
      return 'active';
    } else {
      return 'completed';
    }
  }, []);

  // Função para calcular tempo restante em segundos (CORRIGIDA)
  const calculateTimeRemaining = useCallback((endDate: string) => {
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    // CORREÇÃO: Converter data UTC do banco para Brasília
    const endUTC = new Date(endDate);
    const endBrasilia = new Date(endUTC.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    const diff = endBrasilia.getTime() - brasiliaTime.getTime();
    
    logger.debug('Calculando tempo restante (CORRIGIDO)', {
      brasiliaTime: formatBrasiliaDate(brasiliaTime),
      endDateUTC: endUTC.toISOString(),
      endDateBrasilia: formatBrasiliaDate(endBrasilia),
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
