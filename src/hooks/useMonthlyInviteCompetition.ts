
import { useState, useEffect } from 'react';
import { monthlyInviteService } from '@/services/monthlyInviteService';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

interface MonthlyInviteData {
  userPoints: {
    invite_points: number;
    invites_count: number;
    active_invites_count: number;
    month_year: string;
  };
  competition: any;
  rankings: any[];
  userPosition: any;
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
    topPerformers: any[];
  };
}

export const useMonthlyInviteCompetition = (monthYear?: string) => {
  const [data, setData] = useState<MonthlyInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const loadData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load user points
      const userPointsResponse = await monthlyInviteService.getUserMonthlyPoints(user?.id, monthYear);
      
      // Load ranking data
      const rankingResponse = await monthlyInviteService.getMonthlyRanking(monthYear);
      
      // Load user position
      const userPositionResponse = await monthlyInviteService.getUserMonthlyPosition(user?.id, monthYear);
      
      // Load stats
      const statsResponse = await monthlyInviteService.getMonthlyStats(monthYear);

      if (userPointsResponse.success && rankingResponse.success && statsResponse.success) {
        // Garantir que userPoints sempre tenha as propriedades necessárias
        const defaultUserPoints = {
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: monthYear || new Date().toISOString().slice(0, 7)
        };

        // Garantir que stats sempre tenha as propriedades necessárias
        const defaultStats = {
          totalParticipants: 0,
          totalPrizePool: 0,
          topPerformers: []
        };

        // Safely handle statsResponse.data
        const statsData = statsResponse.data && typeof statsResponse.data === 'object' 
          ? statsResponse.data as any 
          : {};

        setData({
          userPoints: userPointsResponse.data ? {
            ...defaultUserPoints,
            ...userPointsResponse.data
          } : defaultUserPoints,
          competition: (rankingResponse.data as any)?.competition || null,
          rankings: (rankingResponse.data as any)?.rankings || [],
          userPosition: userPositionResponse.data || null,
          stats: {
            ...defaultStats,
            ...statsData
          }
        });
      } else {
        setError('Erro ao carregar dados da competição mensal');
      }
    } catch (err) {
      logger.error('Erro ao carregar competição mensal', { error: err }, 'MONTHLY_INVITE_HOOK');
      setError('Erro ao carregar dados da competição');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRanking = async () => {
    try {
      const response = await monthlyInviteService.refreshMonthlyRanking(monthYear);
      if (response.success) {
        await loadData(); // Reload all data
      }
      return response;
    } catch (error) {
      logger.error('Erro ao atualizar ranking', { error }, 'MONTHLY_INVITE_HOOK');
      return { success: false, error: 'Erro ao atualizar ranking' };
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user?.id, monthYear]);

  return {
    data,
    isLoading,
    error,
    refreshRanking,
    refetch: loadData
  };
};
