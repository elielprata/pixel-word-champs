
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AdvancedWeeklyStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  config: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date?: string | null;
    custom_end_date?: string | null;
    reference_date?: string | null;
  } | null;
  top_3_players: Array<{
    username: string;
    score: number;
    position: number;
    prize: number;
  }>;
}

export const useAdvancedWeeklyStats = () => {
  return useQuery({
    queryKey: ['advancedWeeklyStats'],
    queryFn: async (): Promise<AdvancedWeeklyStats> => {
      logger.info('Buscando estatísticas avançadas do ranking semanal com sistema de referência', undefined, 'ADVANCED_WEEKLY_STATS');
      
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) {
        logger.error('Erro ao buscar estatísticas avançadas', { error: error.message }, 'ADVANCED_WEEKLY_STATS');
        throw error;
      }
      
      // Validação e conversão segura do tipo
      if (!data || typeof data !== 'object') {
        throw new Error('Dados inválidos retornados da função get_weekly_ranking_stats');
      }
      
      const stats = data as any;
      
      logger.info('Estatísticas avançadas carregadas com sistema de referência', { 
        participants: stats.total_participants,
        prize_pool: stats.total_prize_pool,
        reference_date: stats.config?.reference_date
      }, 'ADVANCED_WEEKLY_STATS');
      
      return {
        current_week_start: stats.current_week_start,
        current_week_end: stats.current_week_end,
        total_participants: stats.total_participants || 0,
        total_prize_pool: stats.total_prize_pool || 0,
        last_update: stats.last_update,
        config: stats.config ? {
          start_day_of_week: stats.config.start_day_of_week,
          duration_days: stats.config.duration_days,
          custom_start_date: stats.config.custom_start_date || null,
          custom_end_date: stats.config.custom_end_date || null,
          reference_date: stats.config.reference_date || null,
        } : null,
        top_3_players: stats.top_3_players || []
      };
    },
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });
};
