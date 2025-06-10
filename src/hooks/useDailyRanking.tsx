
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';

export const useDailyRanking = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando ranking semanal (não há mais ranking diário separado)...');
      const ranking = await rankingApi.getWeeklyRanking();
      
      console.log('✅ Ranking semanal carregado:', ranking.length, 'jogadores');
      setWeeklyRanking(ranking);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking semanal:', err);
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
