
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { logger } from '@/utils/logger';

export const useDailyRanking = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info('Carregando ranking semanal', undefined, 'DAILY_RANKING');
      const ranking = await rankingApi.getWeeklyRanking();
      
      logger.info('Ranking semanal carregado', { 
        playersCount: ranking.length 
      }, 'DAILY_RANKING');
      setWeeklyRanking(ranking);
    } catch (err) {
      logger.error('Erro ao carregar ranking semanal', { error: err }, 'DAILY_RANKING');
      setError('Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyRanking();
  }, []);

  return {
    dailyRanking: weeklyRanking, // Retorna ranking semanal no lugar do diário
    isLoading,
    error,
    refetch: loadWeeklyRanking
  };
};
