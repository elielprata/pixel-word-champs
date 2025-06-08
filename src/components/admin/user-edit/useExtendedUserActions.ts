
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useExtendedUserActions = (userId: string, username: string, onUserUpdated: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const updateUserProfile = async (updateData: any) => {
    try {
      setIsLoading(true);
      console.log(`🔄 Atualizando perfil do usuário:`, userId, updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        throw error;
      }

      console.log('✅ Perfil atualizado com sucesso');

      toast({
        title: "Sucesso!",
        description: `Dados atualizados para ${username}`,
      });

      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar dados: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (newRole: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      console.log(`🔄 Atualizando role para ${newRole} do usuário:`, userId);

      // Remover roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
        throw deleteError;
      }

      // Adicionar novo role
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

      console.log('✅ Role atualizado:', newRole);

      toast({
        title: "Sucesso!",
        description: `Permissão atualizada para ${newRole === 'admin' ? 'Administrador' : 'Usuário'} para ${username}`,
      });

      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro:', error);
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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

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

  const toggleBanStatus = async (banned: boolean, reason?: string) => {
    try {
      setIsLoading(true);
      console.log(`🔄 ${banned ? 'Banindo' : 'Desbanindo'} usuário:`, userId);

      const updateData: any = {
        is_banned: banned,
        banned_at: banned ? new Date().toISOString() : null,
        ban_reason: banned ? reason : null,
        banned_by: banned ? (await supabase.auth.getUser()).data.user?.id : null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao alterar status de banimento:', error);
        throw error;
      }

      console.log(`✅ Status de banimento alterado: ${banned}`);

      toast({
        title: "Sucesso!",
        description: `Usuário ${banned ? 'banido' : 'desbanido'} com sucesso`,
      });

      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: `Erro ao alterar status: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    updateUserRole,
    updatePassword,
    toggleBanStatus,
    isLoading,
    isChangingPassword,
  };
};
