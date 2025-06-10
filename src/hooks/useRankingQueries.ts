
import { useState } from 'react';
import { RankingPlayer } from '@/types';
import { rankingQueryService } from '@/services/rankingQueryService';

export const useRankingQueries = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      const ranking = await rankingQueryService.getWeeklyRanking();
      setWeeklyRanking(ranking);
    } catch (err) {
      console.error('Erro ao carregar ranking semanal:', err);
      setError('Erro ao carregar ranking semanal');
    }
  };

  const loadHistoricalRanking = async (userId: string) => {
    try {
      const competitions = await rankingQueryService.getHistoricalCompetitions(userId);
      setHistoricalCompetitions(competitions);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico');
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
