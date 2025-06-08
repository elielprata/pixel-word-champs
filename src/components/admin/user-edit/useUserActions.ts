
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
      console.log('🔐 Tentando atualizar senha do usuário:', userId);

      // Como não temos acesso direto às funções admin, vamos usar uma abordagem alternativa
      // Registrar a solicitação de mudança de senha como uma ação administrativa
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário administrativo não autenticado');
      }

      // Registrar a ação de tentativa de mudança de senha
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.user.id,
          target_user_id: userId,
          action_type: 'password_change_request',
          details: { 
            username: username,
            requested_at: new Date().toISOString(),
            status: 'manual_required'
          }
        });

      if (logError) {
        console.warn('⚠️ Erro ao registrar log:', logError);
      }

      // Informar que a mudança de senha precisa ser feita manualmente
      toast({
        title: "Ação Registrada",
        description: `Solicitação de mudança de senha registrada para ${username}. Esta ação requer configuração manual no Supabase.`,
        variant: "default",
      });

      console.log('📝 Ação de mudança de senha registrada para processamento manual');

    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: `Erro ao processar mudança de senha: ${error.message || 'Erro desconhecido'}`,
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
