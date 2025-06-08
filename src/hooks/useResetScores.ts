
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useResetScores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetAllScoresMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      console.log('🔒 Iniciando reset de pontuações...');
      
      // Verificar senha do admin
      if (adminPassword !== 'admin123') {
        console.error('❌ Senha incorreta fornecida');
        throw new Error('Senha de administrador incorreta');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Senha validada, iniciando reset...');

      // Zerar pontuação de todos os usuários
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (resetError) {
        console.error('❌ Erro ao resetar pontuações:', resetError);
        throw resetError;
      }

      console.log('✅ Pontuações resetadas com sucesso');

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: currentUser.user.id,
          action_type: 'reset_all_scores',
          details: { 
            timestamp: new Date().toISOString(),
            affected_users: 'all'
          }
        });

      if (logError) {
        console.warn('⚠️ Erro ao registrar log da ação:', logError);
      }

      console.log('✅ Reset completo realizado com sucesso');
    },
    onSuccess: () => {
      console.log('🎉 Reset de pontuações finalizado');
      toast({
        title: "Pontuações zeradas",
        description: "A pontuação de todos os usuários foi zerada com sucesso.",
      });
      
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['dailyRanking'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRanking'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro no reset de pontuações:', error);
      toast({
        title: "Erro ao zerar pontuações",
        description: error.message || "Ocorreu um erro ao tentar zerar as pontuações.",
        variant: "destructive",
      });
    },
  });

  return {
    resetAllScores: resetAllScoresMutation.mutate,
    isResettingScores: resetAllScoresMutation.isPending,
  };
};
