
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { Competition } from '@/types';

export const useActiveCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await competitionService.getActiveCompetitions();
      
      if (response.success) {
        setCompetitions(response.data);
      } else {
        setError(response.error || 'Erro ao carregar competições');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competições ativas:', err);
      setError('Erro ao carregar competições ativas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCompetitions();
  }, []);

  return {
    competitions,
    isLoading,
    error,
    refetch: fetchActiveCompetitions
  };
};
