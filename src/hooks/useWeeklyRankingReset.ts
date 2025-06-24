
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface ResetResult {
  success: boolean;
  profiles_reset: number;
  rankings_cleared: number;
  week_start: string;
  week_end: string;
  reset_at: string;
}

export const useWeeklyRankingReset = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ResetResult> => {
      logger.info('Iniciando reset de pontuações semanais', undefined, 'WEEKLY_RANKING_RESET');
      
      const { data, error } = await supabase.rpc('reset_weekly_scores_and_positions');
      
      if (error) {
        logger.error('Erro ao resetar pontuações', { error: error.message }, 'WEEKLY_RANKING_RESET');
        throw error;
      }
      
      // Type assertion para garantir que data é do tipo correto
      const resetData = data as ResetResult;
      
      logger.info('Reset executado com sucesso', { 
        profiles_reset: resetData.profiles_reset,
        rankings_cleared: resetData.rankings_cleared 
      }, 'WEEKLY_RANKING_RESET');
      
      return resetData;
    },
    onSuccess: (data) => {
      toast({
        title: "Reset Executado com Sucesso!",
        description: `${data.profiles_reset} perfis resetados e ${data.rankings_cleared} rankings limpos.`,
      });
      
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['weeklyRanking'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRankingStats'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
    },
    onError: (error: any) => {
      logger.error('Erro no reset de pontuações', { error: error.message }, 'WEEKLY_RANKING_RESET');
      toast({
        title: "Erro no Reset",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
