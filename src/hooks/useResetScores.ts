
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useResetScores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetAllScoresMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      console.log('🔑 Verificando senha admin:', adminPassword);
      
      // Verificar senha do admin (senha padrão: admin123)
      if (adminPassword.trim() !== 'admin123') {
        console.log('❌ Senha incorreta fornecida:', adminPassword);
        throw new Error('Senha de administrador incorreta');
      }

      console.log('✅ Senha validada com sucesso');

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', currentUser.user.email);

      // Zerar pontuação de todos os usuários
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Atualizar todos

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
          target_user_id: currentUser.user.id, // Self reference para ação global
          action_type: 'reset_all_scores',
          details: { 
            affected_users: 'all',
            timestamp: new Date().toISOString(),
            performed_by: currentUser.user.email
          }
        });

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      } else {
        console.log('📝 Ação administrativa registrada');
      }
    },
    onSuccess: () => {
      console.log('🎉 Reset de pontuações concluído com sucesso');
      toast({
        title: "Pontuações zeradas",
        description: "A pontuação de todos os usuários foi zerada com sucesso.",
      });
      
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['dailyRankings'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRankings'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro no reset de pontuações:', error);
      toast({
        title: "Erro ao zerar pontuações",
        description: error.message || 'Erro desconhecido ao zerar pontuações',
        variant: "destructive",
      });
    },
  });

  return {
    resetAllScores: resetAllScoresMutation.mutate,
    isResettingScores: resetAllScoresMutation.isPending,
  };
};
