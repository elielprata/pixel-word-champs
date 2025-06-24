
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
    custom_start_date?: string;
    custom_end_date?: string;
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
      logger.info('Buscando estatísticas avançadas do ranking semanal', undefined, 'ADVANCED_WEEKLY_STATS');
      
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) {
        logger.error('Erro ao buscar estatísticas avançadas', { error: error.message }, 'ADVANCED_WEEKLY_STATS');
        throw error;
      }
      
      // Converter Json do Supabase para o tipo correto
      const statsData = data as any;
      
      logger.info('Estatísticas avançadas carregadas', { 
        participants: statsData.total_participants,
        prize_pool: statsData.total_prize_pool 
      }, 'ADVANCED_WEEKLY_STATS');
      
      return {
        current_week_start: statsData.current_week_start,
        current_week_end: statsData.current_week_end,
        total_participants: statsData.total_participants || 0,
        total_prize_pool: statsData.total_prize_pool || 0,
        last_update: statsData.last_update,
        config: statsData.config || null,
        top_3_players: statsData.top_3_players || []
      };
    },
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });
};
