
import { useEffect } from 'react';
import { useCompetitionQueries } from './useCompetitionQueries';

export const useCompetitions = () => {
  const {
    competitions,
    customCompetitions,
    dailyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchActiveCompetitions,
    fetchCustomCompetitions,
    fetchDailyCompetition
  } = useCompetitionQueries();

  const loadAllCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchActiveCompetitions(),
        fetchCustomCompetitions(),
        fetchDailyCompetition()
      ]);
    } catch (err) {
      setError('Erro ao carregar competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCompetitions();
  }, []);

  return {
    competitions,
    customCompetitions,
    dailyCompetition,
    isLoading,
    error,
    refetch: loadAllCompetitions
  };
};
