
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { rankingService } from '@/services/rankingService';

export const useRankingData = () => {
  const [dailyRanking, setDailyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [historicalCompetitions, setHistoricalCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(20);
  const [weeklyLimit, setWeeklyLimit] = useState(20);
  const { user } = useAuth();

  const loadRankingData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando dados dos rankings...');
      
      // Tentar atualizar rankings primeiro
      try {
        await Promise.all([
          rankingService.updateDailyRanking(),
          rankingService.updateWeeklyRanking()
        ]);
        console.log('✅ Rankings atualizados com sucesso');
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar rankings, continuando com dados existentes:', updateError);
      }

      // Carregar dados dos rankings
      const [daily, weekly, historical] = await Promise.all([
        rankingApi.getDailyRanking(),
        rankingApi.getWeeklyRanking(),
        user?.id ? rankingApi.getHistoricalRanking(user.id) : Promise.resolve([])
      ]);

      console.log('📊 Dados carregados:', {
        daily: daily.length,
        weekly: weekly.length,
        historical: historical.length
      });

      setDailyRanking(daily);
      setWeeklyRanking(weekly);
      setHistoricalCompetitions(historical);
    } catch (err) {
      console.error('❌ Erro ao carregar dados dos rankings:', err);
      setError('Erro ao carregar rankings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreDaily = () => {
    if (dailyLimit < 100) {
      setDailyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  const loadMoreWeekly = () => {
    if (weeklyLimit < 100) {
      setWeeklyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  const getUserPosition = (ranking: RankingPlayer[]) => {
    if (!user) return null;
    const userIndex = ranking.findIndex(player => player.user_id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  useEffect(() => {
    loadRankingData();
  }, [user?.id]);

  return {
    dailyRanking: dailyRanking.slice(0, dailyLimit),
    weeklyRanking: weeklyRanking.slice(0, weeklyLimit),
    historicalCompetitions,
    isLoading,
    error,
    canLoadMoreDaily: dailyLimit < 100 && dailyRanking.length > dailyLimit,
    canLoadMoreWeekly: weeklyLimit < 100 && weeklyRanking.length > weeklyLimit,
    loadMoreDaily,
    loadMoreWeekly,
    getUserPosition,
    refetch: loadRankingData
  };
};
