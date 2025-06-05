
import { useState, useEffect } from 'react';
import { rankingApi } from '@/api/rankingApi';
import { competitionService } from '@/services/competitionService';
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
      const [daily, weekly] = await Promise.all([
        rankingApi.getDailyRanking(),
        rankingApi.getWeeklyRanking()
      ]);

      setDailyRanking(daily);
      setWeeklyRanking(weekly);
    } catch (err) {
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
  }, []);

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
