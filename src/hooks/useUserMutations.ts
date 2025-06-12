
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminId }: { userId: string; reason: string; adminId: string }) => {
      console.log('🚫 Banindo usuário:', { userId, reason, adminId });

      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: adminId,
          ban_reason: reason
        } as any)
        .eq('id', userId as any);

      if (error) {
        console.error('❌ Erro ao banir usuário:', error);
        throw error;
      }

      console.log('✅ Usuário banido com sucesso');
    },
    onSuccess: () => {
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao banir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível banir o usuário.",
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async ({ userId, adminId }: { userId: string; adminId: string }) => {
      console.log('✅ Removendo ban do usuário:', { userId, adminId });

      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        } as any)
        .eq('id', userId as any);

      if (error) {
        console.error('❌ Erro ao remover ban:', error);
        throw error;
      }

      console.log('✅ Ban removido com sucesso');
    },
    onSuccess: () => {
      toast({
        title: "Ban removido",
        description: "O ban do usuário foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao remover ban:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o ban do usuário.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminId }: { userId: string; adminId: string }) => {
      console.log('🗑️ Deletando usuário:', { userId, adminId });

      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId as any);

      if (profileError) {
        console.error('❌ Erro ao deletar perfil:', profileError);
        throw profileError;
      }

      // Then delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('❌ Erro ao deletar usuário da auth:', authError);
        throw authError;
      }

      console.log('✅ Usuário deletado com sucesso');
    },
    onSuccess: () => {
      toast({
        title: "Usuário deletado",
        description: "O usuário foi deletado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o usuário.",
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
