
import { useUsersQuery } from './useUsersQuery';
import { useAdminUsers } from './useAdminUsers';
import { useRealUserStats } from './useRealUserStats';
import { useOptimizedSystemHealth } from './useOptimizedSystemHealth';
import { logger } from '@/utils/logger';
import { type AdminData } from '@/types/admin';

export const useAdminData = (): AdminData => {
  // Coordenar queries relacionadas para otimizar performance
  const usersQuery = useUsersQuery();
  const adminUsersQuery = useAdminUsers();
  const userStatsQuery = useRealUserStats();
  const systemHealthQuery = useOptimizedSystemHealth();

  const isLoading = usersQuery.isLoading || adminUsersQuery.isLoading || systemHealthQuery.isLoading;
  const hasError = usersQuery.error || systemHealthQuery.error;

  const refetchAll = () => {
    logger.info('Atualizando todos os dados do admin', undefined, 'ADMIN_DATA');
    usersQuery.refetch();
    adminUsersQuery.refetch();
    userStatsQuery.refetch();
    systemHealthQuery.refetch();
  };

  return {
    users: usersQuery.data || [],
    adminUsers: adminUsersQuery.usersList || [],
    userStats: userStatsQuery.data,
    systemHealth: systemHealthQuery.data,
    isLoading,
    hasError,
    refetchAll
  };
};
