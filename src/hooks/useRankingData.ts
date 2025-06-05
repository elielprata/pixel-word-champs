
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { RankingPlayer } from '@/types';
import { useAuth } from '@/hooks/useAuth';

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
      const [daily, weekly, historical] = await Promise.all([
        rankingApi.getDailyRanking(),
        rankingApi.getWeeklyRanking(),
        user?.id ? rankingApi.getHistoricalRanking(user.id) : Promise.resolve([])
      ]);

      setDailyRanking(daily);
      setWeeklyRanking(weekly);
      setHistoricalCompetitions(historical);
    } catch (err) {
      setError('Erro ao carregar rankings');
      console.error('Error loading ranking data:', err);
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
