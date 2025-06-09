
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { Competition } from '@/types';

export const useDailyCompetition = () => {
  const [dailyCompetition, setDailyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyCompetition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await competitionService.getDailyCompetition();
      
      if (response.success) {
        setDailyCompetition(response.data);
      } else {
        setError(response.error || 'Erro ao carregar competição diária');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competição diária:', err);
      setError('Erro ao carregar competição diária');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyCompetition();
  }, []);

  return {
    dailyCompetition,
    isLoading,
    error,
    refetch: fetchDailyCompetition
  };
};
