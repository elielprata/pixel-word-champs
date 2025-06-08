import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useUserActions = (userId: string, username: string, onUserUpdated: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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

  const updateUserProfile = async (newUsername: string, newEmail: string) => {
    if (!newUsername.trim()) {
      toast({
        title: "Erro",
        description: "O nome de usuário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      console.log('🔄 Atualizando perfil do usuário:', userId);

      // Preparar dados para atualização - apenas username por enquanto
      const updateData: any = { 
        username: newUsername.trim()
      };

      // Atualizar dados na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil atualizado com sucesso');

      // Tentar atualizar email via Edge Function se disponível e for um email real
      if (newEmail && newEmail !== 'Email não disponível' && newEmail.includes('@') && !newEmail.endsWith('@sistema.local')) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data, error } = await supabase.functions.invoke('admin-update-email', {
              body: {
                targetUserId: userId,
                newEmail: newEmail.trim()
              }
            });

            if (error) {
              console.warn('⚠️ Erro ao atualizar email no auth:', error);
            } else {
              console.log('✅ Email atualizado no auth com sucesso');
            }
          }
        } catch (emailError) {
          console.warn('⚠️ Não foi possível atualizar email no auth:', emailError);
        }
      }

      toast({
        title: "Sucesso!",
        description: `Perfil atualizado para ${newUsername}`,
      });

      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
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
    updateUserProfile,
    updatePassword,
    isLoading,
    isChangingPassword,
    isUpdatingProfile,
  };
};
