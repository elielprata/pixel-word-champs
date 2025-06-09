
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';

export const useDailyRanking = () => {
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDailyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando ranking diário consolidado...');
      const ranking = await rankingApi.getDailyRanking();
      
      console.log('✅ Ranking diário carregado:', ranking.length, 'jogadores');
      setDailyRanking(ranking);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking diário:', err);
      setError('Erro ao carregar ranking diário');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDailyRanking();
  }, []);

  return {
    dailyRanking,
    isLoading,
    error,
    refetch: loadDailyRanking
  };
};
