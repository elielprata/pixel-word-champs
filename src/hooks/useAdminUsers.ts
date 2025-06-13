
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

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
      logger.debug('Buscando usuários admin...', undefined, 'USE_ADMIN_USERS');
      
      // Buscar todos os usuários que têm role admin usando as novas políticas
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        logger.error('Erro ao buscar roles de admin', { error: rolesError.message }, 'USE_ADMIN_USERS');
        throw rolesError;
      }

      if (!adminRoles || adminRoles.length === 0) {
        logger.debug('Nenhum usuário admin encontrado', undefined, 'USE_ADMIN_USERS');
        return [];
      }

      const adminUserIds = adminRoles.map(role => role.user_id);
      logger.debug('IDs de usuários admin encontrados', { count: adminUserIds.length }, 'USE_ADMIN_USERS');

      // Buscar os perfis dos usuários admin usando a função otimizada
      const { data: adminProfiles, error: profilesError } = await supabase
        .rpc('get_users_with_real_emails')
        .in('id', adminUserIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis de admin', { error: profilesError.message }, 'USE_ADMIN_USERS');
        throw profilesError;
      }

      const adminUsersData: AdminUser[] = (adminProfiles || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email || 'Email não disponível',
        username: profile.username || 'Usuário sem nome',
        created_at: profile.created_at || new Date().toISOString(),
        role: 'admin'
      }));

      logger.info('Usuários admin carregados com sucesso', { count: adminUsersData.length }, 'USE_ADMIN_USERS');
      return adminUsersData;
    },
  });

  const removeAdminRole = async (userId: string, username: string) => {
    try {
      logger.info('Removendo role de admin', { userId, username }, 'USE_ADMIN_USERS');
      
      // Usar as novas políticas que permitem admins gerenciarem roles
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        logger.error('Erro ao remover role de admin', { error: error.message }, 'USE_ADMIN_USERS');
        throw error;
      }

      logger.info('Role de admin removida com sucesso', { userId }, 'USE_ADMIN_USERS');
      
      toast({
        title: "Administrador removido",
        description: `${username} não é mais administrador.`,
      });
      
      refetch();
    } catch (error: any) {
      logger.error('Erro ao remover administrador', { error: error.message }, 'USE_ADMIN_USERS');
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    usersList: adminUsers || [],
    isLoading,
    removeAdminRole,
    refetch,
  };
};

export type { AdminUser };
