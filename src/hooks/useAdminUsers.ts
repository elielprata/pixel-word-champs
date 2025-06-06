
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  role: string;
}

export const useAdminUsers = () => {
  const { toast } = useToast();

  const { data: adminUsers, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async (): Promise<AdminUser[]> => {
      console.log('🔍 Buscando usuários admin...');
      
      // Buscar todos os usuários que têm role admin
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('❌ Erro ao buscar admins:', rolesError);
        throw rolesError;
      }

      console.log('📋 Admin roles encontrados:', adminRoles);

      if (!adminRoles || adminRoles.length === 0) {
        return [];
      }

      // Buscar dados dos usuários nos profiles
      const userIds = adminRoles.map(r => r.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      // Buscar dados adicionais dos usuários do auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Erro ao buscar dados do auth:', authError);
        // Se não conseguir buscar do auth, usar apenas dados do profiles
        return (profiles || []).map(profile => ({
          id: profile.id,
          email: 'Email não disponível',
          username: profile.username || 'Username não disponível',
          created_at: profile.created_at || new Date().toISOString(),
          role: 'admin'
        }));
      }

      // Combinar dados do auth com profiles
      const combinedData: AdminUser[] = (profiles || []).map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Email não disponível',
          username: profile.username || 'Username não disponível',
          created_at: authUser?.created_at || profile.created_at || new Date().toISOString(),
          role: 'admin'
        };
      });

      return combinedData;
    },
  });

  const removeAdminRole = async (userId: string, username: string): Promise<void> => {
    try {
      console.log('🗑️ Removendo role admin do usuário:', userId);
      
      // Remover role admin
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (deleteError) {
        console.error('❌ Erro ao remover role admin:', deleteError);
        throw deleteError;
      }

      // Adicionar role user se não existir
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'user'
        });

      if (insertError) {
        console.error('❌ Erro ao adicionar role user:', insertError);
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: `${username} agora é um usuário comum`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar permissões",
        variant: "destructive",
      });
    }
  };

  // Explicitly type usersList with safe default and proper typing
  const usersList: AdminUser[] = adminUsers ?? [];

  return {
    usersList,
    isLoading,
    removeAdminRole,
    refetch
  };
};

export type { AdminUser };
