
import { useEffect } from 'react';
import { useCompetitionQueries } from '@/hooks/competitions/useCompetitionQueries';

export const useCompetitions = () => {
  const {
    competitions,
    customCompetitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    setIsLoading,
    setError,
    fetchActiveCompetitions,
    fetchCustomCompetitions,
    fetchDailyCompetition,
    fetchWeeklyCompetition
  } = useCompetitionQueries();

  const loadAllCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchActiveCompetitions(),
        fetchCustomCompetitions(),
        fetchDailyCompetition(),
        fetchWeeklyCompetition()
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
    weeklyCompetition,
    isLoading,
    error,
    refetch: loadAllCompetitions
  };
};
