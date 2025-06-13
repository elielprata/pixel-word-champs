
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
      logger.info('Iniciando exclusão completa do usuário', { targetUserId: userId }, 'DELETE_USER_MUTATION');
      
      // Validar senha do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Credenciais validadas, chamando Edge Function para exclusão completa...', undefined, 'DELETE_USER_MUTATION');

      // Usar a Edge Function para exclusão completa (perfil + autenticação)
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId: userId,
          adminPassword: adminPassword,
          adminId: currentUser.user.id
        }
      });

      if (error) {
        logger.error('Erro na Edge Function de exclusão', { error: error.message }, 'DELETE_USER_MUTATION');
        throw new Error(`Erro na exclusão: ${error.message}`);
      }

      if (!data?.success) {
        logger.error('Edge Function retornou erro', { error: data?.error }, 'DELETE_USER_MUTATION');
        throw new Error(data?.error || 'Erro desconhecido na exclusão');
      }

      logger.info('Usuário completamente excluído', { 
        targetUserId: userId,
        deletedUsername: data.deletedUsername 
      }, 'DELETE_USER_MUTATION');

      return data;
    },
    onSuccess: (data) => {
      logger.info('Exclusão completa concluída com sucesso', { 
        deletedUserId: data.deletedUserId,
        deletedUsername: data.deletedUsername
      }, 'DELETE_USER_MUTATION');
      
      toast({
        title: "Usuário excluído completamente",
        description: `O usuário "${data.deletedUsername}" foi excluído permanentemente do sistema (perfil + autenticação).`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão completa', { error: error.message }, 'DELETE_USER_MUTATION');
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
