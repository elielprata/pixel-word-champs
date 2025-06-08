
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useUsersQuery, AllUsersData } from './useUsersQuery';
import { useUserMutations } from './useUserMutations';

export const useAllUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: usersList = [], isLoading, refetch } = useUsersQuery();
  const { banUser, deleteUser, unbanUser, isBanningUser, isDeletingUser, isUnbanningUser } = useUserMutations();

  const resetAllScoresMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      // Verificar senha admin (simulação)
      if (adminPassword !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Resetar pontuações
      const { error } = await supabase
        .from('profiles')
        .update({ 
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Evitar erro com IDs inválidos

      if (error) throw error;

      // Registrar ação administrativa
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: currentUser.user.id, // Auto-referência para ação global
          action_type: 'reset_all_scores',
          details: { timestamp: new Date().toISOString() }
        });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Todas as pontuações foram zeradas.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    usersList,
    isLoading,
    refetch,
    banUser,
    deleteUser,
    unbanUser,
    isBanningUser,
    isDeletingUser,
    isUnbanningUser,
    resetAllScores: resetAllScoresMutation.mutate,
    isResettingScores: resetAllScoresMutation.isPending,
  };
};

export type { AllUsersData };
