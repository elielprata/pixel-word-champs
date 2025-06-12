
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useUnbanUserMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      logger.info('Iniciando desbanimento do usuário', { targetUserId: userId }, 'UNBAN_USER_MUTATION');
      
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
        logger.error('Erro ao desbanir usuário', { error: error.message }, 'UNBAN_USER_MUTATION');
        throw error;
      }

      logger.info('Usuário desbanido com sucesso', { targetUserId: userId }, 'UNBAN_USER_MUTATION');

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
      logger.info('Desbanimento concluído com sucesso', undefined, 'UNBAN_USER_MUTATION');
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      logger.error('Erro no desbanimento', { error: error.message }, 'UNBAN_USER_MUTATION');
      toast({
        title: "Erro ao desbanir usuário",
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
