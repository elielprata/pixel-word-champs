import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useUserActions = (userId: string, username: string, onUserUpdated: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const updateUserRole = async (newRole: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      // Log para auditoria sem dados sensíveis
      logger.info('Atualizando role de usuário', { newRole }, 'USER_ROLE_UPDATE');

      // Verificar roles atuais antes de modificar
      const { data: currentRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (fetchError) {
        logger.error('Erro ao buscar roles atuais', { error: fetchError.message }, 'USER_ROLE_UPDATE');
        throw fetchError;
      }

      // Primeiro, remover todos os roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        logger.error('Erro ao remover roles existentes', { error: deleteError.message }, 'USER_ROLE_UPDATE');
        throw deleteError;
      }

      // Depois, adicionar o novo role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) {
        logger.error('Erro ao adicionar novo role', { error: insertError.message }, 'USER_ROLE_UPDATE');
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: `Permissão atualizada para ${newRole === 'admin' ? 'Administrador' : 'Usuário'} para ${username}`,
      });

      // Aguardar um pouco antes de atualizar para garantir que a transação foi commitada
      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      logger.error('Erro ao atualizar role de usuário', { error: error.message }, 'USER_ROLE_UPDATE');
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
      // Log para auditoria sem dados sensíveis
      logger.info('Atualizando perfil de usuário', { hasUsername: !!newUsername }, 'USER_PROFILE_UPDATE');

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
        logger.error('Erro ao atualizar perfil', { error: profileError.message }, 'USER_PROFILE_UPDATE');
        throw profileError;
      }

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
              logger.warn('Erro ao atualizar email via edge function', { hasError: !!error }, 'USER_PROFILE_UPDATE');
            }
          }
        } catch (emailError) {
          // Email update falhou - silencioso em produção
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
      logger.error('Erro ao atualizar perfil de usuário', { error: error.message }, 'USER_PROFILE_UPDATE');
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
      // Log para auditoria sem dados sensíveis
      logger.security('Tentativa de alteração de senha', { timestamp: new Date().toISOString() }, 'PASSWORD_UPDATE');

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
        logger.error('Erro na edge function de senha', { hasError: !!error }, 'PASSWORD_UPDATE');
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      // Senha atualizada com sucesso - silencioso

      toast({
        title: "Sucesso!",
        description: `Senha atualizada para ${username}`,
      });

      // Aguardar um pouco antes de atualizar para garantir que a transação foi commitada
      setTimeout(() => {
        onUserUpdated();
      }, 500);

    } catch (error: any) {
      logger.error('Erro ao atualizar senha', { error: error.message }, 'PASSWORD_UPDATE');
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
