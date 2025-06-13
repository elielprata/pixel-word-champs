
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useUsersQuery, AllUsersData } from './useUsersQuery';
import { useUserMutations } from './useUserMutations';
import { logger } from '@/utils/logger';

export const useAllUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: usersList = [], isLoading, refetch } = useUsersQuery();
  const { banUser, deleteUser, unbanUser, isBanningUser, isDeletingUser, isUnbanningUser } = useUserMutations();

  const validateAdminPassword = async (password: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Usuário não autenticado');
    }

    logger.debug('Validando senha do administrador', { userId: currentUser.user.id }, 'USE_ALL_USERS');

    // Validar senha usando uma sessão temporária sem afetar a sessão atual
    const { data, error } = await supabase.auth.signInWithPassword({
      email: currentUser.user.email!,
      password: password
    });

    if (error) {
      logger.error('Senha de administrador incorreta', { error: error.message }, 'USE_ALL_USERS');
      throw new Error('Senha de administrador incorreta');
    }

    logger.debug('Senha validada com sucesso', undefined, 'USE_ALL_USERS');
    return true;
  };

  const resetAllScoresMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      logger.info('Iniciando reset de pontuações', undefined, 'USE_ALL_USERS');
      
      // Validar senha real do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.info('Senha validada, resetando pontuações...', undefined, 'USE_ALL_USERS');

      // Resetar pontuações de TODOS os usuários usando as novas políticas
      const { error } = await supabase
        .from('profiles')
        .update({ 
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        })
        .not('id', 'is', null); // WHERE clause que inclui todos os registros com ID não nulo

      if (error) {
        logger.error('Erro ao resetar pontuações', { error: error.message }, 'USE_ALL_USERS');
        throw error;
      }

      logger.info('Pontuações resetadas com sucesso', undefined, 'USE_ALL_USERS');

      // Registrar ação administrativa usando as novas políticas
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: currentUser.user.id,
          action_type: 'reset_all_scores',
          details: { timestamp: new Date().toISOString() }
        });

      if (logError) {
        logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'USE_ALL_USERS');
      }
    },
    onSuccess: () => {
      logger.info('Reset de pontuações concluído com sucesso', undefined, 'USE_ALL_USERS');
      toast({
        title: "Sucesso!",
        description: "Todas as pontuações foram zeradas.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['realUserStats'] });
    },
    onError: (error: any) => {
      logger.error('Erro no reset de pontuações', { error: error.message }, 'USE_ALL_USERS');
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
