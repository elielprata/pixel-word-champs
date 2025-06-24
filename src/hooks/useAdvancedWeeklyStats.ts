
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
      
      logger.info('Estatísticas avançadas carregadas', { 
        participants: data.total_participants,
        prize_pool: data.total_prize_pool 
      }, 'ADVANCED_WEEKLY_STATS');
      
      return data;
    },
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });
};
