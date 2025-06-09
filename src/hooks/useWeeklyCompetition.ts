
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { Competition } from '@/types';

export const useWeeklyCompetition = () => {
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyCompetition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await competitionService.getWeeklyCompetition();
      
      if (response.success) {
        setWeeklyCompetition(response.data);
      } else {
        setError(response.error || 'Erro ao carregar competição semanal');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competição semanal:', err);
      setError('Erro ao carregar competição semanal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyCompetition();
  }, []);

  return {
    weeklyCompetition,
    isLoading,
    error,
    refetch: fetchWeeklyCompetition
  };
};
