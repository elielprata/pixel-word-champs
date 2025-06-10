
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProfile = useMutation({
    mutationFn: async ({ userId, username, email }: { userId: string; username: string; email: string }) => {
      console.log('🔄 Atualizando perfil do usuário:', { userId, username, email });
      
      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil atualizado com sucesso');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutação de atualização:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil do usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      console.log('🔄 Atualizando role do usuário:', { userId, role });
      
      // Remover roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
        throw deleteError;
      }

      // Adicionar nova role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (insertError) {
        console.error('❌ Erro ao inserir nova role:', insertError);
        throw insertError;
      }

      console.log('✅ Role atualizada com sucesso');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutação de role:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões do usuário",
        variant: "destructive",
      });
    },
  });

  const updatePassword = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      console.log('🔄 Atualizando senha do usuário:', userId);
      
      const response = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar senha');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('❌ Erro na mutação de senha:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar senha do usuário",
        variant: "destructive",
      });
    },
  });

  const resetUserScores = useMutation({
    mutationFn: async (password: string) => {
      console.log('🔄 Resetando pontuações de todos os usuários...');
      
      // Verificar senha do admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se é admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) throw new Error('Usuário não é administrador');

      // Tentar fazer login com a senha fornecida para validar
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (authError) throw new Error('Senha incorreta');

      // Resetar pontuações
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ 
          total_score: 0,
          games_played: 0,
          best_daily_position: null,
          best_weekly_position: null
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Atualizar todos os perfis

      if (resetError) throw resetError;

      console.log('✅ Pontuações resetadas com sucesso');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso",
        description: "Pontuações resetadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao resetar pontuações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao resetar pontuações",
        variant: "destructive",
      });
    },
  });

  return {
    updateProfile,
    updateUserRole,
    updatePassword,
    resetUserScores
  };
};
