
import { useState, useEffect } from 'react';
import { RankingPlayer } from '@/types';
import { useRankingQueries } from './ranking/useRankingQueries';
import { useRankingPagination } from './useRankingPagination';

export const useWeeklyRanking = () => {
  const {
    weeklyRanking,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadWeeklyRanking
  } = useRankingQueries();

  const {
    weeklyLimit,
    loadMoreWeekly,
    canLoadMoreWeekly
  } = useRankingPagination();

  const loadRanking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadWeeklyRanking();
    } catch (err) {
      setError('Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return {
    weeklyRanking: weeklyRanking.slice(0, weeklyLimit),
    isLoading,
    error,
    canLoadMoreWeekly: canLoadMoreWeekly(weeklyRanking.length),
    loadMoreWeekly,
    refetch: loadRanking
  };
};
