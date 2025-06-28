
import { useCallback } from 'react';
import { monthlyInviteService } from '@/services/monthlyInvite';
import { logger } from '@/utils/logger';

export const useMonthlyInviteActions = (monthYear?: string, refetch?: () => Promise<void>) => {
  const refreshRanking = useCallback(async () => {
    try {
      logger.debug('Atualizando ranking mensal', { monthYear }, 'MONTHLY_INVITE_HOOK');
      const response = await monthlyInviteService.refreshMonthlyRanking(monthYear);
      if (response.success && refetch) {
        await refetch(); // Recarregar todos os dados
        logger.info('Ranking atualizado e dados recarregados', undefined, 'MONTHLY_INVITE_HOOK');
      }
      return response;
    } catch (error) {
      logger.error('Erro ao atualizar ranking', { error }, 'MONTHLY_INVITE_HOOK');
      return { success: false, error: 'Erro ao atualizar ranking' };
    }
  }, [monthYear, refetch]);

  return { refreshRanking };
};
