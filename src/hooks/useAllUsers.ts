
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export interface AllUsersData {
  id: string;
  username: string;
  email?: string;
  total_score: number;
  games_played: number;
  is_banned: boolean;
  banned_at?: string;
  banned_by?: string;
  ban_reason?: string;
  created_at: string;
  roles: string[];
}

export const useAllUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usersList = [], isLoading, refetch } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async (): Promise<AllUsersData[]> => {
      console.log('🔍 Buscando todos os usuários...');
      
      // Buscar profiles com dados básicos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Buscar roles para todos os usuários
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.warn('⚠️ Erro ao buscar roles:', rolesError);
      }

      // Mapear dados
      const users: AllUsersData[] = profiles.map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.id).map(r => r.role) || ['user'];
        
        return {
          id: profile.id,
          username: profile.username || 'Usuário',
          email: `${profile.username}@sistema`, // Fallback já que não temos acesso ao auth.users
          total_score: profile.total_score || 0,
          games_played: profile.games_played || 0,
          is_banned: profile.is_banned || false,
          banned_at: profile.banned_at,
          banned_by: profile.banned_by,
          ban_reason: profile.ban_reason,
          created_at: profile.created_at,
          roles: userRoles
        };
      });

      console.log('👥 Total de usuários encontrados:', users.length);
      return users;
    },
    retry: 2,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason, adminPassword }: { userId: string; reason: string; adminPassword: string }) => {
      // Verificar senha do admin (simulação - em produção seria mais seguro)
      if (adminPassword !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }

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
          banned_by: currentUser.user.id,
          ban_reason: reason
        })
        .eq('id', userId);

      if (banError) throw banError;

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

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminPassword }: { userId: string; adminPassword: string }) => {
      // Verificar senha do admin (simulação)
      if (adminPassword !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

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

      // Deletar usuário (cascade irá deletar relacionados)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null
        })
        .eq('id', userId);

      if (error) throw error;

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

  return {
    usersList,
    isLoading,
    refetch,
    banUser: banUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    isBanningUser: banUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isUnbanningUser: unbanUserMutation.isPending,
  };
};
