
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { rankingService } from '@/services/rankingService';

export const useWeeklyRanking = () => {
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyLimit, setWeeklyLimit] = useState(20);

  const loadWeeklyRanking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando ranking semanal...');
      
      // Tentar atualizar ranking primeiro
      try {
        await rankingService.updateWeeklyRanking();
        console.log('✅ Ranking semanal atualizado com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar ranking semanal, continuando com dados existentes:', updateError);
      }

      // Carregar dados do ranking
      const weekly = await rankingApi.getWeeklyRanking();
      console.log('📊 Ranking semanal carregado:', weekly.length);

      setWeeklyRanking(weekly);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking semanal:', err);
      setError('Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreWeekly = () => {
    if (weeklyLimit < 100) {
      setWeeklyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  useEffect(() => {
    loadWeeklyRanking();
  }, []);

  return {
    weeklyRanking: weeklyRanking.slice(0, weeklyLimit),
    isLoading,
    error,
    canLoadMoreWeekly: weeklyLimit < 100 && weeklyRanking.length > weeklyLimit,
    loadMoreWeekly,
    refetch: loadWeeklyRanking
  };
};
