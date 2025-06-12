
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminId }: { 
      userId: string; 
      reason: string; 
      adminId: string; 
    }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Banir usuário
      const { error: banError } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: adminId,
          ban_reason: reason
        } as any)
        .eq('id', userId as any);

      if (banError) throw banError;

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          target_user_id: userId,
          action_type: 'ban_user',
          details: { reason }
        } as any);

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }
    },
    onSuccess: () => {
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao banir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async ({ userId, adminId }: { userId: string; adminId: string }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Desbanir usuário
      const { error: unbanError } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        } as any)
        .eq('id', userId as any);

      if (unbanError) throw unbanError;

      // Registrar ação administrativa
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          target_user_id: userId,
          action_type: 'unban_user',
          details: {}
        } as any);

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }
    },
    onSuccess: () => {
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao desbanir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminId }: { userId: string; adminId: string }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Registrar ação antes de deletar
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          target_user_id: userId,
          action_type: 'delete_user',
          details: {}
        } as any);

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }

      // Deletar perfil do usuário
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId as any);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      toast({
        title: "Usuário deletado",
        description: "O usuário foi removido permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    banUser: banUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};
