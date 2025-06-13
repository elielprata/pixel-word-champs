
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRankingQueries } from './useRankingQueries';

export const useHistoricalRanking = () => {
  const { user } = useAuth();
  const {
    historicalCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    loadHistoricalRanking
  } = useRankingQueries();

  const loadRanking = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await loadHistoricalRanking(user.id);
    } catch (err) {
      setError('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [user?.id]);

  return {
    historicalCompetitions,
    isLoading,
    error,
    refetch: loadRanking
  };
};
