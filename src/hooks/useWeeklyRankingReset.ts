
import { useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

interface ResetResponse {
  success: boolean;
  profiles_reset: number;
  rankings_cleared: number;
  week_start: string;
  week_end: string;
  reset_at: string;
}

export const useWeeklyRankingReset = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (): Promise<ResetResponse> => {
      logger.info('🔄 Executando reset manual do ranking semanal', undefined, 'WEEKLY_RANKING_RESET');

      const { data, error } = await supabase.rpc('reset_weekly_scores_and_positions');

      if (error) {
        logger.error('❌ Erro no reset do ranking semanal', { error: error.message }, 'WEEKLY_RANKING_RESET');
        throw error;
      }

      logger.info('✅ Reset do ranking semanal concluído', data, 'WEEKLY_RANKING_RESET');
      return data as ResetResponse;
    },
    onSuccess: (data: ResetResponse) => {
      toast({
        title: "Reset Concluído",
        description: `${data.profiles_reset} perfis resetados e ${data.rankings_cleared} registros de ranking removidos.`,
      });

      logger.info('🎉 Reset manual executado com sucesso', {
        profiles_reset: data.profiles_reset,
        rankings_cleared: data.rankings_cleared,
        week_period: `${data.week_start} - ${data.week_end}`
      }, 'WEEKLY_RANKING_RESET');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro desconhecido no reset';
      
      toast({
        title: "Erro no Reset",
        description: errorMessage,
        variant: "destructive",
      });

      logger.error('❌ Erro no reset manual', { error: errorMessage }, 'WEEKLY_RANKING_RESET');
    }
  });
};
