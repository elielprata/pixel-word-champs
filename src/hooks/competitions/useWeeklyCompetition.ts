
import { useState, useEffect } from 'react';
import { Competition } from '@/types';
import { useCompetitionQueries } from './useCompetitionQueries';

export const useWeeklyCompetition = () => {
  const {
    weeklyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchWeeklyCompetition
  } = useCompetitionQueries();

  const loadCompetition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchWeeklyCompetition();
    } catch (err) {
      setError('Erro ao carregar competição semanal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetition();
  }, []);

  return {
    weeklyCompetition,
    isLoading,
    error,
    refetch: loadCompetition
  };
};
