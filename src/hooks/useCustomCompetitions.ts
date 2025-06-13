
import { useState, useEffect } from 'react';
import { useCompetitionQueries } from './competitions/useCompetitionQueries';

export const useCustomCompetitions = () => {
  const {
    customCompetitions,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchCustomCompetitions
  } = useCompetitionQueries();

  const loadCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchCustomCompetitions();
    } catch (err) {
      setError('Erro ao carregar competições customizadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  return {
    customCompetitions,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
