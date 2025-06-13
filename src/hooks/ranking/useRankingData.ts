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

  const { data: dailyRanking = [], isLoading } = useQuery({
    queryKey: ['rankings', dailyLimit],
    queryFn: async (): Promise<RankingEntry[]> => {
      if (!isAuthenticated) {
        logger.warn('Usuário não autenticado tentando acessar ranking', undefined, 'RANKING_DATA');
        return [];
      }

      logger.debug('Buscando ranking diário', { limit: dailyLimit }, 'RANKING_DATA');

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_rankings')
        .select('position, total_score, user_id')
        .eq('day', todayStr)
        .order('position', { ascending: true })
        .limit(dailyLimit);

      if (error) {
        logger.error('Erro ao buscar ranking diário', { error: error.message }, 'RANKING_DATA');
        throw error;
      }

      // Buscar informações dos usuários
      const userIds = data.map(item => item.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis', { error: profilesError.message }, 'RANKING_DATA');
        throw profilesError;
      }

      const enrichedRanking = data.map(item => {
        const profile = profiles.find(p => p.id === item.user_id);
        return {
          pos: item.position,
          name: profile?.username || 'Usuário Desconhecido',
          score: item.total_score,
          avatar_url: profile?.avatar_url || null,
          user_id: item.user_id,
        };
      });

      logger.info('Ranking diário carregado', { count: enrichedRanking.length }, 'RANKING_DATA');
      return enrichedRanking;
    },
    retry: 1,
  });

  return { dailyRanking, isLoading };
};
