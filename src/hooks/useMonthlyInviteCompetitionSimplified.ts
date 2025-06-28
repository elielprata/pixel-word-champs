
import { useState, useEffect, useCallback } from 'react';
import { monthlyInviteUnifiedService } from '@/services/monthlyInvite/monthlyInviteUnified';
import { logger } from '@/utils/logger';

interface MonthlyInviteData {
  competition: any;
  rankings: any[];
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
    topPerformers: any[];
  };
  no_active_competition?: boolean;
  message?: string;
  last_update?: string;
}

export const useMonthlyInviteCompetitionSimplified = (monthYear?: string) => {
  const [data, setData] = useState<MonthlyInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Carregando dados consolidados da competição mensal', { monthYear }, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');

      const response = await monthlyInviteUnifiedService.getMonthlyStats(monthYear);
      
      if (response.success) {
        setData(response.data);
        logger.info('Dados consolidados carregados com sucesso', { 
          hasCompetition: !!response.data?.competition,
          rankingsCount: response.data?.rankings?.length || 0
        }, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('Erro ao carregar dados consolidados', { error: err }, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [monthYear]);

  const refreshRanking = async () => {
    try {
      logger.debug('Atualizando ranking mensal', { monthYear }, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');
      const response = await monthlyInviteUnifiedService.refreshMonthlyRanking(monthYear);
      if (response.success) {
        await loadData(); // Recarregar dados após atualização
        logger.info('Ranking atualizado e dados recarregados', undefined, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');
      }
      return response;
    } catch (error) {
      logger.error('Erro ao atualizar ranking', { error }, 'MONTHLY_INVITE_HOOK_SIMPLIFIED');
      return { success: false, error: 'Erro ao atualizar ranking' };
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refreshRanking,
    refetch: loadData
  };
};
