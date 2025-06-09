
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { rankingService } from '@/services/rankingService';

export const useDailyRanking = () => {
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(20);

  const loadDailyRanking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando ranking diário...');
      
      // Tentar atualizar ranking primeiro
      try {
        await rankingService.updateDailyRanking();
        console.log('✅ Ranking diário atualizado com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar ranking diário, continuando com dados existentes:', updateError);
      }

      // Carregar dados do ranking
      const daily = await rankingApi.getDailyRanking();
      console.log('📊 Ranking diário carregado:', daily.length);

      setDailyRanking(daily);
    } catch (err) {
      console.error('❌ Erro ao carregar ranking diário:', err);
      setError('Erro ao carregar ranking diário');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreDaily = () => {
    if (dailyLimit < 100) {
      setDailyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  useEffect(() => {
    loadDailyRanking();
  }, []);

  return {
    dailyRanking: dailyRanking.slice(0, dailyLimit),
    isLoading,
    error,
    canLoadMoreDaily: dailyLimit < 100 && dailyRanking.length > dailyLimit,
    loadMoreDaily,
    refetch: loadDailyRanking
  };
};
