
import { useState, useEffect } from 'react';
import { Competition } from '@/types';

// Hook depreciado - mantido apenas para compatibilidade
// O sistema agora usa apenas ranking semanal automático
export const useWeeklyCompetition = () => {
  const [weeklyCompetition, setWeeklyCompetition] = useState<Competition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sistema simplificado - não há mais competições semanais
    setWeeklyCompetition(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const refetch = async () => {
    // Não há mais competições semanais para buscar
    return Promise.resolve();
  };

  return {
    weeklyCompetition,
    isLoading,
    error,
    refetch
  };
};
