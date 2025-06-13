import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyRankingEntry } from '@/types';
import { useRankingPagination } from '@/hooks/admin/useRankingPagination';
import { logger } from '@/utils/logger';

interface WeeklyRankingOptions {
  limit?: number;
}

export const useWeeklyRanking = (options: WeeklyRankingOptions = {}) => {
  const { weeklyLimit } = useRankingPagination();
  const limit = options.limit || weeklyLimit;

  return useQuery({
    queryKey: ['weeklyRanking', limit],
    queryFn: async (): Promise<WeeklyRankingEntry[]> => {
      logger.debug('Buscando ranking semanal', { limit }, 'WEEKLY_RANKING');

      // Calcular o primeiro dia da semana atual (segunda-feira)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar ranking semanal', { error: error.message }, 'WEEKLY_RANKING');
        throw error;
      }

      logger.info('Ranking semanal carregado', { count: data.length }, 'WEEKLY_RANKING');
      return data || [];
    },
    retry: 3,
  });
};
