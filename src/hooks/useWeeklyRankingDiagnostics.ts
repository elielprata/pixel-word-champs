
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
      
      // Converter Json do Supabase para o tipo correto
      const diagnosticsData = data as any;
      
      logger.info('Diagnósticos executados com sucesso', { health: diagnosticsData.system_health }, 'WEEKLY_RANKING_DIAGNOSTICS');
      
      return {
        timestamp: diagnosticsData.timestamp,
        system_health: diagnosticsData.system_health || 'warning',
        issues: diagnosticsData.issues || {
          orphaned_rankings: 0,
          duplicate_rankings: 0,
          config_issues: 0
        },
        statistics: diagnosticsData.statistics || {
          active_profiles: 0,
          total_game_sessions: 0,
          completed_sessions: 0,
          completion_rate: 0
        },
        recommendations: diagnosticsData.recommendations || []
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
