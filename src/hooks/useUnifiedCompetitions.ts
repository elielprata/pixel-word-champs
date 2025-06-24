
import { useState, useEffect, useCallback, useMemo } from 'react';
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
        // Filtrar apenas competições diárias
        const dailyCompetitions = (result.data || []).filter(c => c.type === 'daily');
        setCompetitions(dailyCompetitions);
        secureLogger.debug('Competições diárias carregadas com sucesso', { 
          count: dailyCompetitions.length 
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

  // Memoizar filtros para evitar recálculos desnecessários
  const dailyCompetitions = useMemo(() => competitions, [competitions]);
  const activeCompetitions = useMemo(() => 
    competitions.filter(c => c.status === 'active'), [competitions]);

  return {
    competitions,
    dailyCompetitions,
    activeCompetitions,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
