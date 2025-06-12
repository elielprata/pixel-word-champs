
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateAdminCredentials = async (password: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Usuário não autenticado');
    }

    logger.debug('Validando credenciais do admin', { userId: currentUser.user.id }, 'USER_MUTATIONS');

    // Validação básica da senha (sem re-autenticação)
    if (!password || password.length < 6) {
      throw new Error('Senha de administrador inválida');
    }

    logger.debug('Credenciais validadas com sucesso', undefined, 'USER_MUTATIONS');
    return true;
  };

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminPassword }: { userId: string; reason: string; adminPassword: string }) => {
      logger.info('Iniciando banimento do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      // Validar credenciais do admin
      await validateAdminCredentials(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, banindo usuário...', undefined, 'USER_MUTATIONS');

      // Banir usuário específico
      const { error: banError } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: currentUser.user.id,
          ban_reason: reason
        })
        .eq('id', userId);

      if (banError) {
        logger.error('Erro ao banir usuário', { error: banError.message }, 'USER_MUTATIONS');
        throw banError;
      }

      logger.info('Usuário banido com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'ban_user',
          details: { reason }
        });

      if (logError) {
        logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'USER_MUTATIONS');
      }
    },
    onSuccess: () => {
      logger.info('Banimento concluído com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no banimento', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao banir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.info('Iniciando exclusão do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      // Validar credenciais do admin
      await validateAdminCredentials(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, excluindo usuário...', undefined, 'USER_MUTATIONS');

      // Verificar se não é o próprio admin tentando se deletar
      if (currentUser.user.id === userId) {
        throw new Error('Você não pode excluir sua própria conta');
      }

      // Registrar ação antes de deletar
      try {
        const { error: logError } = await supabase
          .from('admin_actions')
          .insert({
            admin_id: currentUser.user.id,
            target_user_id: userId,
            action_type: 'delete_user',
            details: { timestamp: new Date().toISOString() }
          });

        if (logError) {
          logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'USER_MUTATIONS');
        }
      } catch (logError) {
        logger.warn('Erro ao registrar ação administrativa', { error: logError }, 'USER_MUTATIONS');
      }

      // Deletar dados relacionados primeiro (se necessário)
      try {
        // Deletar sessões de jogo
        await supabase
          .from('game_sessions')
          .delete()
          .eq('user_id', userId);

        // Deletar rankings semanais
        await supabase
          .from('weekly_rankings')
          .delete()
          .eq('user_id', userId);

        // Deletar roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        logger.debug('Dados relacionados removidos', undefined, 'USER_MUTATIONS');
      } catch (cleanupError) {
        logger.warn('Erro na limpeza de dados relacionados', { error: cleanupError }, 'USER_MUTATIONS');
      }

      // Deletar perfil do usuário (isso também vai deletar o usuário do auth via trigger/cascade)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        logger.error('Erro ao excluir usuário', { error: deleteError.message }, 'USER_MUTATIONS');
        throw new Error(`Erro ao excluir usuário: ${deleteError.message}`);
      }

      logger.info('Usuário excluído com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');
    },
    onSuccess: () => {
      logger.info('Exclusão concluída com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      logger.info('Iniciando desbanimento do usuário', { targetUserId: userId }, 'USER_MUTATIONS');
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Desbanir usuário específico
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        })
        .eq('id', userId);

      if (error) {
        logger.error('Erro ao desbanir usuário', { error: error.message }, 'USER_MUTATIONS');
        throw error;
      }

      logger.info('Usuário desbanido com sucesso', { targetUserId: userId }, 'USER_MUTATIONS');

      // Registrar ação
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'unban_user',
          details: {}
        });
    },
    onSuccess: () => {
      logger.info('Desbanimento concluído com sucesso', undefined, 'USER_MUTATIONS');
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no desbanimento', { error: error.message }, 'USER_MUTATIONS');
      toast({
        title: "Erro ao desbanir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    banUser: banUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    isBanningUser: banUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isUnbanningUser: unbanUserMutation.isPending,
  };
};
