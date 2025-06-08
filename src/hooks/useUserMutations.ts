
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateAdminPassword = async (password: string) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Usuário não autenticado');
    }

    // Validar senha usando uma sessão temporária sem afetar a sessão atual
    const { data, error } = await supabase.auth.signInWithPassword({
      email: currentUser.user.email!,
      password: password
    });

    if (error) {
      throw new Error('Senha de administrador incorreta');
    }

    // Manter a sessão atual do usuário
    return true;
  };

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminPassword }: { userId: string; reason: string; adminPassword: string }) => {
      console.log('🔐 Iniciando banimento do usuário:', userId);
      
      // Validar senha real do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Senha validada, banindo usuário...');

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
        console.error('❌ Erro ao banir usuário:', banError);
        throw banError;
      }

      console.log('✅ Usuário banido com sucesso');

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
        console.warn('⚠️ Erro ao registrar log:', logError);
      }
    },
    onSuccess: () => {
      console.log('🎉 Banimento concluído com sucesso');
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro no banimento:', error);
      toast({
        title: "Erro ao banir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      console.log('🔐 Iniciando exclusão do usuário:', userId);
      
      // Validar senha real do admin
      await validateAdminPassword(adminPassword);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Senha validada, excluindo usuário...');

      // Registrar ação antes de deletar
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'delete_user',
          details: {}
        });

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }

      // Deletar usuário específico (cascade irá deletar relacionados)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('❌ Erro ao excluir usuário:', deleteError);
        throw deleteError;
      }

      console.log('✅ Usuário excluído com sucesso');
    },
    onSuccess: () => {
      console.log('🎉 Exclusão concluída com sucesso');
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na exclusão:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🔓 Iniciando desbanimento do usuário:', userId);
      
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
        console.error('❌ Erro ao desbanir usuário:', error);
        throw error;
      }

      console.log('✅ Usuário desbanido com sucesso');

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
      console.log('🎉 Desbanimento concluído com sucesso');
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro no desbanimento:', error);
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
