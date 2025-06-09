
import { useState, useEffect } from 'react';
import { RankingPlayer } from '@/types';
import { useRankingQueries } from './useRankingQueries';
import { useRankingPagination } from './useRankingPagination';

export const useDailyRanking = () => {
  const {
    dailyRanking,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadDailyRanking
  } = useRankingQueries();

  const {
    dailyLimit,
    loadMoreDaily,
    canLoadMoreDaily
  } = useRankingPagination();

  const loadRanking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadDailyRanking();
    } catch (err) {
      setError('Erro ao carregar ranking diário');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return {
    dailyRanking: dailyRanking.slice(0, dailyLimit),
    isLoading,
    error,
    canLoadMoreDaily: canLoadMoreDaily(dailyRanking.length),
    loadMoreDaily,
    refetch: loadRanking
  };
};
