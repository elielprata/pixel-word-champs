
import { useAdminData } from './useAdminData';
import { useRealUserStats } from './useRealUserStats';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const useAdminPanelData = () => {
  const adminData = useAdminData();
  const userStats = useRealUserStats();

  const isLoading = adminData.isLoading || userStats.isLoading;
  const hasError = adminData.hasError || userStats.error;

  const refreshAll = () => {
    logger.info('Atualizando todos os dados do painel admin', { 
      timestamp: getCurrentBrasiliaTime() 
    }, 'ADMIN_PANEL_DATA');
    adminData.refetchAll();
    userStats.refetch();
  };

  return {
    ...adminData,
    userStats: userStats.data,
    isStatsLoading: userStats.isLoading,
    statsError: userStats.error,
    isLoading,
    hasError,
    refreshAll
  };
};
