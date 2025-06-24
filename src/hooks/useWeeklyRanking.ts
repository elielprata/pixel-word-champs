
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface WeeklyRankingEntry {
  id: string;
  user_id: string;
  username: string;
  total_score: number;
  position: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
  pix_holder_name?: string;
  week_start: string;
  week_end: string;
}

interface WeeklyStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  config?: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date?: string;
    custom_end_date?: string;
  };
  top_3_players: Array<{
    username: string;
    score: number;
    position: number;
    prize: number;
  }>;
}

export const useWeeklyRanking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para ranking atual
  const { data: currentRanking, isLoading, error, refetch } = useQuery({
    queryKey: ['weeklyRanking'],
    queryFn: async (): Promise<WeeklyRankingEntry[]> => {
      logger.info('Buscando ranking semanal atual', undefined, 'USE_WEEKLY_RANKING');
      
      // Primeiro, atualizar o ranking
      const { error: updateError } = await supabase.rpc('update_weekly_ranking');
      if (updateError) {
        logger.error('Erro ao atualizar ranking', { error: updateError.message }, 'USE_WEEKLY_RANKING');
        throw updateError;
      }

      // Buscar dados do ranking atual
      const currentWeekStart = new Date();
      currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay());
      currentWeekStart.setUTCHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .gte('week_start', currentWeekStart.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking semanal', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }

      logger.info('Ranking semanal carregado', { count: data?.length || 0 }, 'USE_WEEKLY_RANKING');
      return data || [];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Query para estatísticas usando a nova função avançada
  const { data: stats } = useQuery({
    queryKey: ['weeklyRankingStats'],
    queryFn: async (): Promise<WeeklyStats> => {
      logger.info('Buscando estatísticas do ranking semanal', undefined, 'USE_WEEKLY_RANKING');
      
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) {
        logger.error('Erro ao buscar estatísticas', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }

      // Type assertion para garantir que data é do tipo correto
      return data as WeeklyStats;
    },
    refetchInterval: 30000,
  });

  // Mutation para reset usando a nova função
  const resetWeeklyScoresMutation = useMutation({
    mutationFn: async () => {
      logger.info('Executando reset de pontuações semanais', undefined, 'USE_WEEKLY_RANKING');
      
      const { data, error } = await supabase.rpc('reset_weekly_scores_and_positions');
      
      if (error) {
        logger.error('Erro no reset de pontuações', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }
      
      logger.info('Reset executado com sucesso', { data }, 'USE_WEEKLY_RANKING');
      return data;
    },
    onSuccess: (data: any) => {
      const resetData = data as { profiles_reset: number; rankings_cleared: number };
      toast({
        title: "Reset Executado com Sucesso!",
        description: `${resetData.profiles_reset} perfis resetados e ${resetData.rankings_cleared} rankings limpos.`,
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['weeklyRanking'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRankingStats'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
    },
    onError: (error: any) => {
      logger.error('Erro no reset de pontuações', { error: error.message }, 'USE_WEEKLY_RANKING');
      toast({
        title: "Erro no Reset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    currentRanking: currentRanking || [],
    stats,
    isLoading,
    error: error?.message,
    refetch,
    resetWeeklyScores: resetWeeklyScoresMutation.mutate,
    isResettingScores: resetWeeklyScoresMutation.isPending,
  };
};
