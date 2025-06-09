
import { useState, useEffect } from 'react';
import { Competition } from '@/types';
import { useCompetitionQueries } from './useCompetitionQueries';

export const useActiveCompetitions = () => {
  const {
    competitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchActiveCompetitions
  } = useCompetitionQueries();

  const loadCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchActiveCompetitions();
    } catch (err) {
      setError('Erro ao carregar competições ativas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  return {
    competitions,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
