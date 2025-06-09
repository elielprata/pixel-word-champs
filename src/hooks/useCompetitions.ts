
import { useActiveCompetitions } from './useActiveCompetitions';
import { useCustomCompetitions } from './useCustomCompetitions';
import { useDailyCompetition } from './useDailyCompetition';
import { useWeeklyCompetition } from './useWeeklyCompetition';

export const useCompetitions = () => {
  const {
    competitions,
    isLoading: isLoadingActive,
    error: errorActive,
    refetch: refetchActive
  } = useActiveCompetitions();

  const {
    customCompetitions,
    isLoading: isLoadingCustom,
    error: errorCustom,
    refetch: refetchCustom
  } = useCustomCompetitions();

  const {
    dailyCompetition,
    isLoading: isLoadingDaily,
    error: errorDaily,
    refetch: refetchDaily
  } = useDailyCompetition();

  const {
    weeklyCompetition,
    isLoading: isLoadingWeekly,
    error: errorWeekly,
    refetch: refetchWeekly
  } = useWeeklyCompetition();

  const isLoading = isLoadingActive || isLoadingCustom || isLoadingDaily || isLoadingWeekly;
  const error = errorActive || errorCustom || errorDaily || errorWeekly;

  const refetch = async () => {
    await Promise.all([
      refetchActive(),
      refetchCustom(), 
      refetchDaily(),
      refetchWeekly()
    ]);
  };

  return {
    competitions,
    customCompetitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    refetch
  };
};
