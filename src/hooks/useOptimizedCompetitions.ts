
import { useState, useEffect, useMemo } from 'react';
import { Competition } from '@/types';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { logger, structuredLog } from '@/utils/logger';

export const useOptimizedCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confiar completamente no status do banco de dados
  const activeCompetitions = useMemo(() => {
    return competitions.filter(comp => comp.status === 'active');
  }, [competitions]);

  const dailyCompetition = useMemo(() => {
    return customCompetitions.find(comp => 
      comp.competition_type === 'challenge' && 
      comp.status === 'active'
    ) || null;
  }, [customCompetitions]);

  const weeklyCompetition = useMemo(() => {
    return customCompetitions.find(comp => 
      comp.competition_type === 'tournament' && 
      comp.status === 'active'
    ) || null;
  }, [customCompetitions]);

  const loadCompetitions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [competitionsResponse, customCompetitionsResponse] = await Promise.all([
        competitionService.getActiveCompetitions(),
        customCompetitionService.getCustomCompetitions()
      ]);

      if (competitionsResponse.success) {
        setCompetitions(competitionsResponse.data || []);
      } else {
        throw new Error(competitionsResponse.error || 'Erro ao carregar competições');
      }

      if (customCompetitionsResponse.success) {
        setCustomCompetitions(customCompetitionsResponse.data || []);
      } else {
        throw new Error(customCompetitionsResponse.error || 'Erro ao carregar competições customizadas');
      }

      logger.debug('Competições carregadas com sucesso - confiando no banco de dados');
    } catch (err) {
      const errorMessage = 'Erro ao carregar competições';
      setError(errorMessage);
      structuredLog('error', errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
    
    // Atualizar a cada 2 minutos para buscar dados frescos do banco
    const interval = setInterval(loadCompetitions, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    competitions: activeCompetitions,
    customCompetitions,
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
