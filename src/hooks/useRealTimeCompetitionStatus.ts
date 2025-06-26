
import { useState, useEffect, useCallback } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { competitionStatusService } from '@/services/competitionStatusService';
import { logger } from '@/utils/logger';

/**
 * Hook para status de competição em tempo real
 * CORRIGIDO: Agora usa serviço de status com validação robusta
 */
export const useRealTimeCompetitionStatus = (competitions: any[]) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // CORRIGIDO: Função para calcular status em tempo real com validação robusta
  const calculateRealTimeStatus = useCallback((startDate: string, endDate: string) => {
    try {
      return competitionStatusService.calculateCorrectStatus({
        start_date: startDate,
        end_date: endDate
      });
    } catch (error) {
      logger.error('Erro no cálculo de status em tempo real', { error, startDate, endDate }, 'REAL_TIME_STATUS');
      return 'scheduled'; // Fallback seguro
    }
  }, []);

  // CORRIGIDO: Função para calcular tempo restante em segundos
  const calculateTimeRemaining = useCallback((endDate: string) => {
    try {
      const now = new Date();
      const endUTC = new Date(endDate);
      
      if (isNaN(endUTC.getTime())) {
        logger.warn('Data de fim inválida para cálculo de tempo restante', { endDate }, 'REAL_TIME_STATUS');
        return 0;
      }
      
      const diff = endUTC.getTime() - now.getTime();
      
      logger.debug('Calculando tempo restante (VALIDAÇÃO ROBUSTA)', {
        nowUTC: now.toISOString(),
        endUTC: endUTC.toISOString(),
        nowBrasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        endBrasilia: endUTC.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        diffMs: diff,
        diffSeconds: Math.floor(diff / 1000)
      }, 'REAL_TIME_STATUS');
      
      return Math.max(0, Math.floor(diff / 1000));
    } catch (error) {
      logger.error('Erro no cálculo de tempo restante', { error, endDate }, 'REAL_TIME_STATUS');
      return 0;
    }
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

  // Função para forçar correção de status incorretos
  const forceCorrectStatuses = useCallback(async () => {
    try {
      logger.info('🔧 Forçando correção de status incorretos', undefined, 'REAL_TIME_STATUS');
      await competitionTimeService.forceUpdateIncorrectStatuses();
      setLastUpdate(Date.now()); // Forçar re-render
    } catch (error) {
      logger.error('Erro ao forçar correção de status', { error }, 'REAL_TIME_STATUS');
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
  }, [competitions, calculateRealTimeStatus, calculateTimeRemaining, lastUpdate]);

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

  // Auto-correção na inicialização
  useEffect(() => {
    // Executar correção forçada quando o hook é montado
    const timer = setTimeout(() => {
      forceCorrectStatuses();
    }, 1000); // 1 segundo após montagem

    return () => clearTimeout(timer);
  }, [forceCorrectStatuses]);

  return {
    competitions: competitionsWithRealTimeStatus(),
    lastUpdate,
    calculateRealTimeStatus,
    calculateTimeRemaining,
    refreshStatus: () => setLastUpdate(Date.now()),
    forceCorrectStatuses // Expor função para correção manual
  };
};
