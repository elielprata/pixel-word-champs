
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRankingPagination } from '@/hooks/admin/useRankingPagination';
import { logger } from '@/utils/logger';

interface RankingEntry {
  pos: number;
  name: string;
  score: number;
  avatar_url: string | null;
  user_id: string;
}

export const useRankingData = () => {
  const { isAuthenticated } = useAuth();
  const { dailyLimit } = useRankingPagination();

  // Daily ranking based on profiles total_score for today
  const { data: dailyRanking = [], isLoading: isDailyLoading } = useQuery({
    queryKey: ['dailyRanking', dailyLimit],
    queryFn: async (): Promise<RankingEntry[]> => {
      if (!isAuthenticated) {
        logger.warn('Usuário não autenticado tentando acessar ranking', undefined, 'RANKING_DATA');
        return [];
      }

      logger.debug('Buscando ranking diário', { limit: dailyLimit }, 'RANKING_DATA');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(dailyLimit);

      if (error) {
        logger.error('Erro ao buscar ranking diário', { error: error.message }, 'RANKING_DATA');
        throw error;
      }

      const rankings = data?.map((profile, index) => ({
        pos: index + 1,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0,
        avatar_url: profile.avatar_url || null,
        user_id: profile.id
      })) || [];

      logger.info('Ranking diário carregado', { count: rankings.length }, 'RANKING_DATA');
      return rankings;
    },
    retry: 1,
  });

  // Weekly ranking using weekly_rankings table
  const { data: weeklyRanking = [], isLoading: isWeeklyLoading } = useQuery({
    queryKey: ['weeklyRanking', dailyLimit],
    queryFn: async (): Promise<RankingEntry[]> => {
      if (!isAuthenticated) {
        logger.warn('Usuário não autenticado tentando acessar ranking semanal', undefined, 'RANKING_DATA');
        return [];
      }

      logger.debug('Buscando ranking semanal', { limit: dailyLimit }, 'RANKING_DATA');

      // Get current week
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
        .limit(dailyLimit);

      if (error) {
        logger.error('Erro ao buscar ranking semanal', { error: error.message }, 'RANKING_DATA');
        throw error;
      }

      const rankings = data?.map((ranking) => ({
        pos: ranking.position,
        name: ranking.username || 'Usuário',
        score: ranking.total_score || 0,
        avatar_url: null,
        user_id: ranking.user_id
      })) || [];

      logger.info('Ranking semanal carregado', { count: rankings.length }, 'RANKING_DATA');
      return rankings;
    },
    retry: 1,
  });

  const isLoading = isDailyLoading || isWeeklyLoading;

  const refreshData = () => {
    logger.info('Atualizando dados de ranking', undefined, 'RANKING_DATA');
    // Refresh functionality can be added here if needed
  };

  return { 
    dailyRanking, 
    weeklyRanking, 
    isLoading,
    refreshData
  };
};
