
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

interface ProfileData {
  id: string;
  username: string | null;
  created_at: string | null;
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
        .eq('role', 'admin' as any);

      if (rolesError) {
        console.error('❌ Erro ao buscar admins:', rolesError);
        throw rolesError;
      }

      console.log('📋 Admin roles encontrados:', adminRoles);

      if (!adminRoles || adminRoles.length === 0) {
        return [];
      }

      // Buscar dados dos usuários nos profiles
      const userIds = adminRoles
        .filter((r: any) => r && typeof r === 'object' && !('error' in r) && r.user_id)
        .map((r: any) => r.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      // Buscar o usuário atual para comparação
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Mapear dados com fallback inteligente para emails
      const safeProfiles: ProfileData[] = (profiles as any) || [];
      const combinedData: AdminUser[] = safeProfiles.map((profile: ProfileData) => {
        let email = 'Email não disponível';
        
        // Se for o usuário atual logado, usar o email real
        if (currentUser && currentUser.id === profile.id) {
          email = currentUser.email || 'Email não disponível';
        }
        // Fallback baseado no username
        else if (profile.username) {
          // Se o username já parece um email, usar como email
          if (profile.username.includes('@')) {
            email = profile.username;
          } else {
            // Criar um email baseado no username
            email = `${profile.username}@sistema.local`;
          }
        }

        return {
          id: profile.id,
          email: email,
          username: profile.username || 'Username não disponível',
          created_at: profile.created_at || new Date().toISOString(),
          role: 'admin'
        };
      });

      console.log('👥 Admins processados:', combinedData.map(u => ({ username: u.username, email: u.email })));
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
        } as any);

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
