
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useUserActions = (userId: string, username: string, onUserUpdated: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const updateUserRole = async (newRole: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      console.log(`🔄 Atualizando role para ${newRole} do usuário:`, userId);

      // Verificar roles atuais antes de modificar
      const { data: currentRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('❌ Erro ao buscar roles atuais:', fetchError);
        throw fetchError;
      }

      console.log('📋 Roles atuais:', currentRoles);

      // Primeiro, remover todos os roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
        throw deleteError;
      }

      console.log('✅ Roles existentes removidos');

      // Depois, adicionar o novo role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) {
        console.error('❌ Erro ao adicionar novo role:', insertError);
        throw insertError;
      }

      console.log('✅ Novo role adicionado:', newRole);

      toast({
        title: "Sucesso!",
        description: `Permissão atualizada para ${newRole === 'admin' ? 'Administrador' : 'Usuário'} para ${username}`,
      });

      // Aguardar um pouco antes de atualizar para garantir que a transação foi commitada
      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar permissão: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      console.log('🔐 Atualizando senha do usuário via Edge Function:', userId);

      // Get current session to send auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('admin-update-password', {
        body: {
          targetUserId: userId,
          newPassword: newPassword,
          username: username
        }
      });

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Senha atualizada com sucesso:', data.message);

      toast({
        title: "Sucesso!",
        description: `Senha atualizada para ${username}`,
      });

      // Aguardar um pouco antes de atualizar para garantir que a transação foi commitada
      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao atualizar senha:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar senha: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    updateUserRole,
    updatePassword,
    isLoading,
    isChangingPassword,
  };
};
