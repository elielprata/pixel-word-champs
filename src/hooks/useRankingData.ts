
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export const useRankingData = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRankingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Carregando dados do ranking', undefined, 'RANKING_DATA');
      
      const weekly = await rankingApi.getWeeklyRanking();
      setWeeklyRanking(weekly);
      
      logger.info('Dados do ranking carregados', { 
        weeklyCount: weekly.length 
      }, 'RANKING_DATA');
      
    } catch (err) {
      logger.error('Erro ao carregar dados do ranking', { error: err }, 'RANKING_DATA');
      setError('Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRankingData();
  }, []);

  const refetch = () => {
    logger.info('Atualizando dados do ranking', undefined, 'RANKING_DATA');
    loadRankingData();
  };

  return {
    weeklyRanking,
    isLoading,
    error,
    refetch
  };
};
