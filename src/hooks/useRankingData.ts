
import { RankingPlayer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRankingQueries } from './useRankingQueries';
import { useRankingPagination } from './useRankingPagination';
import { useEffect } from 'react';

export const useRankingData = () => {
  const { user } = useAuth();
  const {
    dailyRanking,
    weeklyRanking,
    historicalCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadDailyRanking,
    loadWeeklyRanking,
    loadHistoricalRanking
  } = useRankingQueries();

  const {
    dailyLimit,
    weeklyLimit,
    loadMoreDaily,
    loadMoreWeekly,
    canLoadMoreDaily,
    canLoadMoreWeekly
  } = useRankingPagination();

  const loadAllRankings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadDailyRanking(),
        loadWeeklyRanking(),
        loadHistoricalRanking(user.id)
      ]);
    } catch (err) {
      setError('Erro ao carregar rankings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllRankings();
  }, [user?.id]);

  const getUserPosition = (ranking: RankingPlayer[]) => {
    if (!user) return null;
    const userIndex = ranking.findIndex(player => player.user_id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const refetch = async () => {
    await loadAllRankings();
  };

  return {
    dailyRanking: dailyRanking.slice(0, dailyLimit),
    weeklyRanking: weeklyRanking.slice(0, weeklyLimit),
    historicalCompetitions,
    isLoading,
    error,
    canLoadMoreDaily: canLoadMoreDaily(dailyRanking.length),
    canLoadMoreWeekly: canLoadMoreWeekly(weeklyRanking.length),
    loadMoreDaily,
    loadMoreWeekly,
    getUserPosition,
    refetch
  };
};
