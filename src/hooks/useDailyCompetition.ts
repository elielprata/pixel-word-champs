
import { useState, useEffect } from 'react';
import { Competition } from '@/types';
import { useCompetitionQueries } from './useCompetitionQueries';

export const useDailyCompetition = () => {
  const {
    dailyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchDailyCompetition
  } = useCompetitionQueries();

  const loadCompetition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchDailyCompetition();
    } catch (err) {
      setError('Erro ao carregar competição diária');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetition();
  }, []);

  return {
    dailyCompetition,
    isLoading,
    error,
    refetch: loadCompetition
  };
};
