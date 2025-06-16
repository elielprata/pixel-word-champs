
import { RankingPlayer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRankingQueries } from './useRankingQueries';
import { useRankingPagination } from './useRankingPagination';
import { useEffect } from 'react';

export const useRankingData = () => {
  const { user } = useAuth();
  const {
    weeklyRanking,
    historicalCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadWeeklyRanking,
    loadHistoricalRanking
  } = useRankingQueries();

  const {
    weeklyLimit,
    loadMoreWeekly,
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
    weeklyRanking: weeklyRanking.slice(0, weeklyLimit),
    historicalCompetitions,
    isLoading,
    error,
    canLoadMoreWeekly: canLoadMoreWeekly(weeklyRanking.length),
    loadMoreWeekly,
    getUserPosition,
    refetch
  };
};
