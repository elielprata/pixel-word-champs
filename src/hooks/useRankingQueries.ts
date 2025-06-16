
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { rankingService } from '@/services/rankingService';
import { logger } from '@/utils/logger';

export const useRankingQueries = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      logger.debug('Carregando ranking semanal global', undefined, 'RANKING_QUERIES');
      
      // Tentar atualizar o ranking primeiro
      try {
        await rankingService.updateWeeklyRanking();
        logger.info('Ranking semanal atualizado com sucesso', undefined, 'RANKING_QUERIES');
      } catch (updateError) {
        logger.warn('Erro ao atualizar ranking semanal, continuando com dados existentes', { error: updateError }, 'RANKING_QUERIES');
      }

      const weekly = await rankingApi.getWeeklyRanking();
      logger.info('Ranking semanal carregado', { count: weekly.length }, 'RANKING_QUERIES');
      setWeeklyRanking(weekly);
    } catch (err) {
      logger.error('Erro ao carregar ranking semanal', { error: err }, 'RANKING_QUERIES');
      throw err;
    }
  };

  const loadHistoricalRanking = async (userId: string) => {
    try {
      logger.debug('Carregando histórico de competições', { userId }, 'RANKING_QUERIES');
      
      const historical = await rankingApi.getHistoricalRanking(userId);
      logger.info('Histórico carregado', { count: historical.length }, 'RANKING_QUERIES');
      setHistoricalCompetitions(historical);
    } catch (err) {
      logger.error('Erro ao carregar histórico', { error: err }, 'RANKING_QUERIES');
      throw err;
    }
  };

  return {
    weeklyRanking,
    historicalCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadWeeklyRanking,
    loadHistoricalRanking
  };
};
