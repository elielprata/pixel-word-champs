
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Trash2, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export const AdminUsersList = () => {
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
        return profiles?.map(profile => ({
          id: profile.id,
          email: 'Email não disponível',
          username: profile.username || 'Username não disponível',
          created_at: profile.created_at || new Date().toISOString()
        })) || [];
      }

      // Combinar dados do auth com profiles
      const combinedData: AdminUser[] = profiles?.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Email não disponível',
          username: profile.username || 'Username não disponível',
          created_at: authUser?.created_at || profile.created_at || new Date().toISOString()
        };
      }) || [];

      return combinedData;
    },
  });

  const removeAdminRole = async (userId: string, username: string) => {
    try {
      console.log('🗑️ Removendo role admin do usuário:', userId);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('❌ Erro ao remover role admin:', error);
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Permissões de admin removidas de ${username}`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover permissões de admin",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Administradores ({adminUsers?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {adminUsers && adminUsers.length > 0 ? (
            adminUsers.map((user: AdminUser) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.username}</span>
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Criado em: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAdminRole(user.id, user.username)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum administrador encontrado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
