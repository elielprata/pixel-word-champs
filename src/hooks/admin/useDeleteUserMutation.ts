
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useDeleteUserMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      logger.info('Iniciando exclusão do usuário via Edge Function', { targetUserId: userId }, 'DELETE_USER_MUTATION');
      
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar a Edge Function para deletar o usuário
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId,
          adminId: currentUser.user.id
        }
      });

      if (error) {
        logger.error('Erro na Edge Function de exclusão', { error: error.message }, 'DELETE_USER_MUTATION');
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (!data.success) {
        logger.error('Edge Function retornou erro', { error: data.error }, 'DELETE_USER_MUTATION');
        throw new Error(data.error || 'Erro desconhecido na exclusão');
      }

      logger.info('Exclusão concluída com sucesso via Edge Function', { 
        deletedUserId: data.deletedUserId,
        deletedUsername: data.deletedUsername 
      }, 'DELETE_USER_MUTATION');

      return data;
    },
    onSuccess: (data) => {
      logger.info('Exclusão concluída com sucesso', { data }, 'DELETE_USER_MUTATION');
      toast({
        title: "Usuário excluído",
        description: `O usuário "${data.deletedUsername}" foi excluído permanentemente do sistema.`,
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro na exclusão', { error: error.message }, 'DELETE_USER_MUTATION');
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  return {
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
  };
};
