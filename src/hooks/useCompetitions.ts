
import { useEffect } from 'react';
import { useCompetitionQueries } from './useCompetitionQueries';
import { logger } from '@/utils/logger';

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
      logger.debug('Carregando todas as competições', undefined, 'USE_COMPETITIONS');
      
      await Promise.all([
        fetchActiveCompetitions(),
        fetchCustomCompetitions(),
        fetchDailyCompetition(),
        fetchWeeklyCompetition()
      ]);
      
      logger.info('Todas as competições carregadas com sucesso', undefined, 'USE_COMPETITIONS');
    } catch (err) {
      logger.error('Erro ao carregar competições', { error: err }, 'USE_COMPETITIONS');
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
