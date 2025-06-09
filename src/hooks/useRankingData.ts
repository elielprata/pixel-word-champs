
import { RankingPlayer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useDailyRanking } from './useDailyRanking';
import { useWeeklyRanking } from './useWeeklyRanking';
import { useHistoricalRanking } from './useHistoricalRanking';

export const useRankingData = () => {
  const { user } = useAuth();
  
  const {
    dailyRanking,
    isLoading: isLoadingDaily,
    error: errorDaily,
    canLoadMoreDaily,
    loadMoreDaily,
    refetch: refetchDaily
  } = useDailyRanking();

  const {
    weeklyRanking,
    isLoading: isLoadingWeekly,
    error: errorWeekly,
    canLoadMoreWeekly,
    loadMoreWeekly,
    refetch: refetchWeekly
  } = useWeeklyRanking();

  const {
    historicalCompetitions,
    isLoading: isLoadingHistorical,
    error: errorHistorical,
    refetch: refetchHistorical
  } = useHistoricalRanking();

  const isLoading = isLoadingDaily || isLoadingWeekly || isLoadingHistorical;
  const error = errorDaily || errorWeekly || errorHistorical;

  const getUserPosition = (ranking: RankingPlayer[]) => {
    if (!user) return null;
    const userIndex = ranking.findIndex(player => player.user_id === user.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const refetch = async () => {
    await Promise.all([
      refetchDaily(),
      refetchWeekly(),
      refetchHistorical()
    ]);
  };

  return {
    dailyRanking,
    weeklyRanking,
    historicalCompetitions,
    isLoading,
    error,
    canLoadMoreDaily,
    canLoadMoreWeekly,
    loadMoreDaily,
    loadMoreWeekly,
    getUserPosition,
    refetch
  };
};
