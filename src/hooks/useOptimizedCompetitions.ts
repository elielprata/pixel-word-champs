
import { useState, useEffect, useMemo } from 'react';
import { Competition } from '@/types';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { calculateCompetitionStatus } from '@/utils/brasiliaTimeUnified';
import { logger, structuredLog } from '@/utils/logger';

export const useOptimizedCompetitions = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [customCompetitions, setCustomCompetitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar competições ativas para evitar re-renderizações desnecessárias
  const activeCompetitions = useMemo(() => {
    return competitions.filter(comp => 
      calculateCompetitionStatus(comp.start_date, comp.end_date) === 'active'
    );
  }, [competitions]);

  const dailyCompetition = useMemo(() => {
    return customCompetitions.find(comp => 
      comp.competition_type === 'challenge' && 
      calculateCompetitionStatus(comp.start_date, comp.end_date) === 'active'
    ) || null;
  }, [customCompetitions]);

  const weeklyCompetition = useMemo(() => {
    return customCompetitions.find(comp => 
      comp.competition_type === 'tournament' && 
      calculateCompetitionStatus(comp.start_date, comp.end_date) === 'active'
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
        setCompetitions(competitionsResponse.data);
      } else {
        throw new Error(competitionsResponse.error || 'Erro ao carregar competições');
      }

      if (customCompetitionsResponse.success) {
        setCustomCompetitions(customCompetitionsResponse.data);
      } else {
        throw new Error(customCompetitionsResponse.error || 'Erro ao carregar competições customizadas');
      }

      logger.debug('Competições carregadas com sucesso');
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
    
    // Configurar intervalo para atualizar status das competições
    const interval = setInterval(() => {
      // Força re-cálculo dos memos baseados em status
      setCompetitions(prev => [...prev]);
      setCustomCompetitions(prev => [...prev]);
    }, 60000); // A cada minuto

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
