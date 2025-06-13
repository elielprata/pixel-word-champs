
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const validateAdminPassword = async (password: string) => {
  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user) {
    throw new Error('Usuário não autenticado');
  }

  logger.debug('Validando senha do administrador', { userId: currentUser.user.id }, 'UNBAN_USER_MUTATION');

  // Criar sessão temporária para validar senha sem afetar a sessão atual
  const { data, error } = await supabase.auth.signInWithPassword({
    email: currentUser.user.email!,
    password: password
  });

  if (error) {
    logger.error('Senha de administrador incorreta', { error: error.message }, 'UNBAN_USER_MUTATION');
    throw new Error('Senha de administrador incorreta');
  }

  logger.debug('Senha validada com sucesso', undefined, 'UNBAN_USER_MUTATION');
  return true;
};

export const useUnbanUserMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const unbanUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      logger.info('Iniciando desbloqueio do usuário', { targetUserId: userId }, 'UNBAN_USER_MUTATION');
      
      // Validar senha do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, desbloqueando usuário...', undefined, 'UNBAN_USER_MUTATION');

      // Desbanir usuário usando as novas políticas padronizadas
      const { error: unbanError } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        })
        .eq('id', userId);

      if (unbanError) {
        logger.error('Erro ao desbanir usuário', { error: unbanError.message }, 'UNBAN_USER_MUTATION');
        throw unbanError;
      }

      logger.info('Usuário desbloqueado com sucesso', { targetUserId: userId }, 'UNBAN_USER_MUTATION');

      // Registrar ação administrativa usando as novas políticas
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'unban_user',
          details: { timestamp: new Date().toISOString() }
        });

      if (logError) {
        logger.warn('Erro ao registrar log de ação administrativa', { error: logError.message }, 'UNBAN_USER_MUTATION');
      }
    },
    onSuccess: () => {
      logger.info('Desbloqueio concluído com sucesso', undefined, 'UNBAN_USER_MUTATION');
      toast({
        title: "Usuário desbloqueado",
        description: "O usuário foi desbloqueado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no desbloqueio', { error: error.message }, 'UNBAN_USER_MUTATION');
      toast({
        title: "Erro ao desbloquear usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    unbanUser: unbanUserMutation.mutate,
    isUnbanningUser: unbanUserMutation.isPending,
  };
};
