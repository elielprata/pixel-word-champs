
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface DuplicateData {
  user_id: string;
  week_start: string;
  week_end: string;
  count: number;
}

interface IntegrityResults {
  duplicate_count: number;
  duplicates: DuplicateData[];
  checked_at: string;
}

export const useWeeklyRankingIntegrity = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<IntegrityResults | null>(null);

  const checkIntegrity = useCallback(async () => {
    setIsChecking(true);
    try {
      logger.info('Verificando integridade do ranking semanal', undefined, 'RANKING_INTEGRITY');
      
      const { data, error } = await supabase.rpc('detect_ranking_duplicates');
      
      if (error) {
        logger.error('Erro ao verificar integridade do ranking', { error }, 'RANKING_INTEGRITY');
        throw error;
      }

      setResults(data);
      
      if (data.duplicate_count > 0) {
        logger.warn('Duplicatas detectadas no ranking', { 
          count: data.duplicate_count,
          duplicates: data.duplicates 
        }, 'RANKING_INTEGRITY');
      } else {
        logger.info('Integridade do ranking verificada - sem problemas', undefined, 'RANKING_INTEGRITY');
      }

      return data;
    } catch (error: any) {
      logger.error('Erro na verificação de integridade', { error }, 'RANKING_INTEGRITY');
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const forceRankingUpdate = useCallback(async () => {
    try {
      logger.info('Forçando atualização do ranking semanal', undefined, 'RANKING_INTEGRITY');
      
      const { error } = await supabase.rpc('update_weekly_ranking');
      
      if (error) {
        logger.error('Erro ao forçar atualização do ranking', { error }, 'RANKING_INTEGRITY');
        throw error;
      }

      logger.info('Ranking atualizado com sucesso', undefined, 'RANKING_INTEGRITY');
      
      // Verificar integridade após atualização
      await checkIntegrity();
    } catch (error: any) {
      logger.error('Erro na atualização forçada do ranking', { error }, 'RANKING_INTEGRITY');
      throw error;
    }
  }, [checkIntegrity]);

  return {
    isChecking,
    results,
    checkIntegrity,
    forceRankingUpdate
  };
};
