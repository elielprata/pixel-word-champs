
import { useQuery } from '@tanstack/react-query';
import { useUsersQuery } from './useUsersQuery';
import { useAdminUsers } from './useAdminUsers';
import { useRealUserStats } from './useRealUserStats';
import { logger } from '@/utils/logger';

export const useAdminData = () => {
  // Coordenar queries relacionadas para otimizar performance
  const usersQuery = useUsersQuery();
  const adminUsersQuery = useAdminUsers();
  const userStatsQuery = useRealUserStats();

  // Query para verificar saúde do sistema
  const systemHealthQuery = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      logger.debug('Verificando saúde do sistema admin', undefined, 'ADMIN_DATA');
      
      const startTime = Date.now();
      const healthChecks = {
        database: false,
        authentication: false,
        permissions: false,
        performance: 0
      };

      try {
        // Verificar conexão com banco
        const { error: dbError } = await import('@/integrations/supabase/client').then(
          ({ supabase }) => supabase.from('profiles').select('id').limit(1)
        );
        healthChecks.database = !dbError;
        
        // Verificar autenticação
        const { data: { user }, error: authError } = await import('@/integrations/supabase/client').then(
          ({ supabase }) => supabase.auth.getUser()
        );
        healthChecks.authentication = !authError && !!user;
        
        // Verificar permissões
        if (user) {
          const { error: permError } = await import('@/integrations/supabase/client').then(
            ({ supabase }) => supabase.rpc('is_admin')
          );
          healthChecks.permissions = !permError;
        }
        
        healthChecks.performance = Date.now() - startTime;
        
        logger.info('Verificação de saúde concluída', { healthChecks }, 'ADMIN_DATA');
        return healthChecks;
      } catch (error: any) {
        logger.error('Erro na verificação de saúde', { error: error.message }, 'ADMIN_DATA');
        healthChecks.performance = Date.now() - startTime;
        return healthChecks;
      }
    },
    staleTime: 2 * 60 * 1000, // Verificar a cada 2 minutos
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 minutos
  });

  const isLoading = usersQuery.isLoading || adminUsersQuery.isLoading || systemHealthQuery.isLoading;
  const hasError = usersQuery.error || systemHealthQuery.error;

  return {
    users: usersQuery.data || [],
    adminUsers: adminUsersQuery.usersList || [],
    userStats: userStatsQuery.data,
    systemHealth: systemHealthQuery.data,
    isLoading,
    hasError,
    refetchAll: () => {
      logger.info('Atualizando todos os dados do admin', undefined, 'ADMIN_DATA');
      usersQuery.refetch();
      adminUsersQuery.refetch();
      userStatsQuery.refetch();
      systemHealthQuery.refetch();
    }
  };
};
