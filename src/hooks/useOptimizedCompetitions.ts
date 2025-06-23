
import { useState, useEffect, useMemo } from 'react';
import { Competition } from '@/types';
import { customCompetitionService } from '@/services/customCompetitionService';
import { calculateCompetitionStatus } from '@/utils/brasiliaTime';
import { logger } from '@/utils/logger';

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
      logger.debug('Carregando competições otimizadas', undefined, 'OPTIMIZED_COMPETITIONS');
      
      const customCompetitionsResponse = await customCompetitionService.getCustomCompetitions();

      if (customCompetitionsResponse.success) {
        setCustomCompetitions(customCompetitionsResponse.data);
        logger.info('Competições customizadas carregadas', { count: customCompetitionsResponse.data.length }, 'OPTIMIZED_COMPETITIONS');
      } else {
        throw new Error(customCompetitionsResponse.error || 'Erro ao carregar competições customizadas');
      }

      // Simular competições básicas vazias por ora
      setCompetitions([]);
      
      logger.info('Competições carregadas com sucesso', undefined, 'OPTIMIZED_COMPETITIONS');
    } catch (err) {
      const errorMessage = 'Erro ao carregar competições';
      setError(errorMessage);
      logger.error(errorMessage, { error: err }, 'OPTIMIZED_COMPETITIONS');
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
