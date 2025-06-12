
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useResetScores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetAllScoresMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      // Verificar senha do admin
      if (adminPassword !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Zerar pontuação de todos os usuários
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          total_score: 0,
          games_played: 0
        } as any)
        .neq('id', '00000000-0000-0000-0000-000000000000' as any); // Atualizar todos

      if (resetError) throw resetError;

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: currentUser.user.id, // Self reference para ação global
          action_type: 'reset_all_scores',
          details: { affected_users: 'all' }
        } as any);

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }
    },
    onSuccess: () => {
      toast({
        title: "Pontuações zeradas",
        description: "A pontuação de todos os usuários foi zerada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao zerar pontuações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    resetAllScores: resetAllScoresMutation.mutate,
    isResettingScores: resetAllScoresMutation.isPending,
  };
};
