
import { useState } from 'react';
import { RankingPlayer } from '@/types';

export const useRankingQueries = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      console.log('📊 Sistema de ranking simplificado - carregando ranking vazio');
      setWeeklyRanking([]);
    } catch (err) {
      console.error('Erro ao carregar ranking semanal:', err);
      setError('Erro ao carregar ranking semanal');
    }
  };

  const loadHistoricalRanking = async (userId: string) => {
    try {
      console.log('📊 Sistema de ranking simplificado - histórico vazio');
      setHistoricalCompetitions([]);
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
