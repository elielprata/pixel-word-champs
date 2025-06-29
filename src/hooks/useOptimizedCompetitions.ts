
import { useState, useEffect, useMemo } from 'react';
import { Competition } from '@/types';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { logger, structuredLog } from '@/utils/logger';

export const useOptimizedCompetitions = () => {
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Retornar todas as competições (ativas E agendadas) para a lista principal
  const competitions = useMemo(() => {
    return allCompetitions.filter(comp => 
      comp.status === 'active' || comp.status === 'scheduled'
    );
  }, [allCompetitions]);

  // Manter filtro específico para competições ativas apenas
  const activeCompetitions = useMemo(() => {
    return allCompetitions.filter(comp => comp.status === 'active');
  }, [allCompetitions]);

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
        // Agora incluindo todas as competições, não apenas as ativas
        setAllCompetitions(competitionsResponse.data || []);
      } else {
        throw new Error(competitionsResponse.error || 'Erro ao carregar competições');
      }

      if (customCompetitionsResponse.success) {
        setCustomCompetitions(customCompetitionsResponse.data || []);
      } else {
        throw new Error(customCompetitionsResponse.error || 'Erro ao carregar competições customizadas');
      }

      logger.debug('Competições carregadas com sucesso - incluindo agendadas e ativas');
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
    competitions, // Agora inclui ativas E agendadas
    customCompetitions,
    activeCompetitions, // Apenas ativas (para casos específicos)
    dailyCompetition,
    weeklyCompetition,
    isLoading,
    error,
    refetch: loadCompetitions
  };
};
