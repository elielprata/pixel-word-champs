
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const validateAdminPassword = async (password: string) => {
  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user) {
    throw new Error('Usuário não autenticado');
  }

  logger.debug('Validando senha do administrador', { userId: currentUser.user.id }, 'DELETE_USER_MUTATION');

  // Criar sessão temporária para validar senha sem afetar a sessão atual
  const { data, error } = await supabase.auth.signInWithPassword({
    email: currentUser.user.email!,
    password: password
  });

  if (error) {
    logger.error('Senha de administrador incorreta', { error: error.message }, 'DELETE_USER_MUTATION');
    throw new Error('Senha de administrador incorreta');
  }

  logger.debug('Senha validada com sucesso', undefined, 'DELETE_USER_MUTATION');
  return true;
};

export const useDeleteUserMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.info('Iniciando exclusão do usuário', { targetUserId: userId }, 'DELETE_USER_MUTATION');
      
      // Validar senha do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, excluindo usuário...', undefined, 'DELETE_USER_MUTATION');

      // Deletar perfil do usuário usando as novas políticas padronizadas
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        logger.error('Erro ao deletar usuário', { error: deleteError.message }, 'DELETE_USER_MUTATION');
        throw deleteError;
      }

      logger.info('Usuário deletado com sucesso', { targetUserId: userId }, 'DELETE_USER_MUTATION');

      // Registrar ação administrativa usando as novas políticas
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'delete_user',
          details: { timestamp: new Date().toISOString() }
        });

      if (logError) {
        logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'DELETE_USER_MUTATION');
      }
    },
    onSuccess: () => {
      logger.info('Exclusão concluída com sucesso', undefined, 'DELETE_USER_MUTATION');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão', { error: error.message }, 'DELETE_USER_MUTATION');
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
  };
};
