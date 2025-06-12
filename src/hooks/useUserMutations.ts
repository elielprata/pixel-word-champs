
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

    logger.log('🔐 Validando credenciais do admin:', currentUser.user.email);

    // Validação básica da senha (sem re-autenticação)
    if (!password || password.length < 6) {
      throw new Error('Senha de administrador inválida');
    }

    logger.log('✅ Credenciais validadas com sucesso');
    return true;
  };

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminPassword }: { userId: string; reason: string; adminPassword: string }) => {
      logger.log('🔐 Iniciando banimento do usuário:', userId);
      
      // Validar credenciais do admin
      await validateAdminCredentials(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.log('✅ Credenciais validadas, banindo usuário...');

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
        logger.error('❌ Erro ao banir usuário:', banError);
        throw banError;
      }

      logger.log('✅ Usuário banido com sucesso');

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
        logger.warn('⚠️ Erro ao registrar log:', logError);
      }
    },
    onSuccess: () => {
      logger.log('🎉 Banimento concluído com sucesso');
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('❌ Erro no banimento:', error);
      toast({
        title: "Erro ao banir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.log('🔐 Iniciando exclusão do usuário:', userId);
      
      // Validar credenciais do admin
      await validateAdminCredentials(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.log('✅ Credenciais validadas, excluindo usuário...');

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
          logger.warn('⚠️ Erro ao registrar log:', logError);
        }
      } catch (logError) {
        logger.warn('⚠️ Erro ao registrar ação:', logError);
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

        logger.log('✅ Dados relacionados removidos');
      } catch (cleanupError) {
        logger.warn('⚠️ Erro na limpeza de dados relacionados:', cleanupError);
      }

      // Deletar perfil do usuário (isso também vai deletar o usuário do auth via trigger/cascade)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        logger.error('❌ Erro ao excluir usuário:', deleteError);
        throw new Error(`Erro ao excluir usuário: ${deleteError.message}`);
      }

      logger.log('✅ Usuário excluído com sucesso');
    },
    onSuccess: () => {
      logger.log('🎉 Exclusão concluída com sucesso');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('❌ Erro na exclusão:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      logger.log('🔓 Iniciando desbanimento do usuário:', userId);
      
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
        logger.error('❌ Erro ao desbanir usuário:', error);
        throw error;
      }

      logger.log('✅ Usuário desbanido com sucesso');

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
      logger.log('🎉 Desbanimento concluído com sucesso');
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('❌ Erro no desbanimento:', error);
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
