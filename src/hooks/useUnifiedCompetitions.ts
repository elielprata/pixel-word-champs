
import { useState, useEffect, useCallback } from 'react';
import { UnifiedCompetition } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

export const useUnifiedCompetitions = () => {
  const [competitions, setCompetitions] = useState<UnifiedCompetition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      secureLogger.debug('Carregando competições unificadas', undefined, 'UNIFIED_COMPETITIONS');
      
      const result = await unifiedCompetitionService.getCompetitions();
      
      if (result.success) {
        setCompetitions(result.data || []);
        secureLogger.debug('Competições carregadas com sucesso', { 
          count: result.data?.length || 0 
        }, 'UNIFIED_COMPETITIONS');
      } else {
        throw new Error(result.error || 'Erro ao carregar competições');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      secureLogger.error('Erro ao carregar competições', { error: errorMessage }, 'UNIFIED_COMPETITIONS');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  // Filtros derivados
  const dailyCompetitions = competitions.filter(c => c.type === 'daily');
  const weeklyCompetitions = competitions.filter(c => c.type === 'weekly');
  const activeCompetitions = competitions.filter(c => c.status === 'active');
  
  const activeWeeklyCompetition = weeklyCompetitions.find(c => c.status === 'active') || null;

  return {
    competitions,
    dailyCompetitions,
    weeklyCompetitions,
    activeCompetitions,
    activeWeeklyCompetition,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
