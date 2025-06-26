
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
    custom_start_date?: string | null;
    custom_end_date?: string | null;
    reference_date?: string | null;
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
      logger.info('Buscando ranking semanal atual com sistema de referência', undefined, 'USE_WEEKLY_RANKING');
      
      // Primeiro, atualizar o ranking
      const { error: updateError } = await supabase.rpc('update_weekly_ranking');
      if (updateError) {
        logger.error('Erro ao atualizar ranking', { error: updateError.message }, 'USE_WEEKLY_RANKING');
        throw updateError;
      }

      // Buscar dados do ranking atual baseado na função de referência
      const { data: statsData, error: statsError } = await supabase.rpc('get_weekly_ranking_stats');
      if (statsError) {
        logger.error('Erro ao buscar stats para período atual', { error: statsError.message }, 'USE_WEEKLY_RANKING');
        throw statsError;
      }

      const stats = statsData as any;
      const currentWeekStart = stats.current_week_start;

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .eq('week_start', currentWeekStart)
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar ranking semanal', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }

      logger.info('Ranking semanal carregado com sistema de referência', { 
        count: data?.length || 0,
        week_start: currentWeekStart
      }, 'USE_WEEKLY_RANKING');
      return data || [];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Query para estatísticas usando a nova função com referência
  const { data: stats } = useQuery({
    queryKey: ['weeklyRankingStats'],
    queryFn: async (): Promise<WeeklyStats> => {
      logger.info('Buscando estatísticas do ranking semanal com sistema de referência', undefined, 'USE_WEEKLY_RANKING');
      
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) {
        logger.error('Erro ao buscar estatísticas', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }

      // Validação e conversão segura do tipo
      if (!data || typeof data !== 'object') {
        throw new Error('Dados inválidos retornados da função get_weekly_ranking_stats');
      }

      const statsData = data as any;
      return {
        current_week_start: statsData.current_week_start,
        current_week_end: statsData.current_week_end,
        total_participants: statsData.total_participants || 0,
        total_prize_pool: statsData.total_prize_pool || 0,
        last_update: statsData.last_update,
        config: statsData.config ? {
          start_day_of_week: statsData.config.start_day_of_week,
          duration_days: statsData.config.duration_days,
          custom_start_date: statsData.config.custom_start_date || null,
          custom_end_date: statsData.config.custom_end_date || null,
          reference_date: statsData.config.reference_date || null,
        } : undefined,
        top_3_players: statsData.top_3_players || []
      };
    },
    refetchInterval: 30000,
  });

  // Mutation para reset usando a nova função
  const resetWeeklyScoresMutation = useMutation({
    mutationFn: async () => {
      logger.info('Executando reset de pontuações semanais com sistema de referência', undefined, 'USE_WEEKLY_RANKING');
      
      const { data, error } = await supabase.rpc('reset_weekly_scores_and_positions');
      
      if (error) {
        logger.error('Erro no reset de pontuações', { error: error.message }, 'USE_WEEKLY_RANKING');
        throw error;
      }
      
      logger.info('Reset executado com sucesso usando sistema de referência', { data }, 'USE_WEEKLY_RANKING');
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
      queryClient.invalidateQueries({ queryKey: ['weeklyConfigSync'] });
      queryClient.invalidateQueries({ queryKey: ['advancedWeeklyStats'] });
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
