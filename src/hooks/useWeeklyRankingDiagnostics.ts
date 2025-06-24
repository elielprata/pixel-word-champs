
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface DiagnosticsResult {
  timestamp: string;
  system_health: 'healthy' | 'warning' | 'critical';
  issues: {
    orphaned_rankings: number;
    duplicate_rankings: number;
    config_issues: number;
  };
  statistics: {
    active_profiles: number;
    total_game_sessions: number;
    completed_sessions: number;
    completion_rate: number;
  };
  recommendations: string[];
}

export const useWeeklyRankingDiagnostics = () => {
  return useQuery({
    queryKey: ['weeklyRankingDiagnostics'],
    queryFn: async (): Promise<DiagnosticsResult> => {
      logger.info('Executando diagnósticos do sistema de ranking', undefined, 'WEEKLY_RANKING_DIAGNOSTICS');
      
      const { data, error } = await supabase.rpc('diagnose_ranking_system');
      
      if (error) {
        logger.error('Erro ao executar diagnósticos', { error: error.message }, 'WEEKLY_RANKING_DIAGNOSTICS');
        throw error;
      }
      
      // Type assertion para garantir que data é do tipo correto
      const diagnostics = data as DiagnosticsResult;
      
      logger.info('Diagnósticos executados com sucesso', { health: diagnostics.system_health }, 'WEEKLY_RANKING_DIAGNOSTICS');
      return diagnostics;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
