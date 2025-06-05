
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { Competition } from '@/types';

export const useCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [competitionsResponse, dailyResponse, weeklyResponse] = await Promise.all([
        competitionService.getActiveCompetitions(),
        competitionService.getDailyCompetition(),
        competitionService.getWeeklyCompetition()
      ]);

      if (competitionsResponse.success) {
        setCompetitions(competitionsResponse.data);
      } else {
        setError(competitionsResponse.error || 'Erro ao carregar competições');
      }

      if (dailyResponse.success) {
        setDailyCompetition(dailyResponse.data);
      }

      if (weeklyResponse.success) {
        setWeeklyCompetition(weeklyResponse.data);
      }
    } catch (err) {
      setError('Erro ao carregar dados das competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    refetch: fetchCompetitions
  };
};
