
import { useState, useEffect } from 'react';
import { customCompetitionService } from '@/services/customCompetitionService';

export const useCustomCompetitions = () => {
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await customCompetitionService.getCustomCompetitions();
      
      if (response.success) {
        setCustomCompetitions(response.data);
      } else {
        setError(response.error || 'Erro ao carregar competições customizadas');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar competições customizadas:', err);
      setError('Erro ao carregar competições customizadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomCompetitions();
  }, []);

  return {
    customCompetitions,
    isLoading,
    error,
    refetch: fetchCustomCompetitions
  };
};
