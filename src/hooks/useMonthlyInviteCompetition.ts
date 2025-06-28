
import { useState, useEffect } from 'react';
import { monthlyInviteService } from '@/services/monthlyInvite';
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
    setIsLoading(true);
    setError(null);

    try {
      // Se não estiver autenticado, criar dados padrão
      if (!isAuthenticated || !user?.id) {
        const defaultData: MonthlyInviteData = {
          userPoints: {
            invite_points: 0,
            invites_count: 0,
            active_invites_count: 0,
            month_year: monthYear || new Date().toISOString().slice(0, 7)
          },
          competition: null,
          rankings: [],
          userPosition: null,
          stats: {
            totalParticipants: 0,
            totalPrizePool: 0,
            topPerformers: []
          }
        };
        setData(defaultData);
        return;
      }

      // Load all data in parallel
      const [userPointsResponse, rankingResponse, userPositionResponse, statsResponse] = await Promise.allSettled([
        monthlyInviteService.getUserMonthlyPoints(user.id, monthYear),
        monthlyInviteService.getMonthlyRanking(monthYear),
        monthlyInviteService.getUserMonthlyPosition(user.id, monthYear),
        monthlyInviteService.getMonthlyStats(monthYear)
      ]);

      // Process results with fallbacks
      const userPoints = userPointsResponse.status === 'fulfilled' && userPointsResponse.value.success
        ? userPointsResponse.value.data
        : {
            invite_points: 0,
            invites_count: 0,
            active_invites_count: 0,
            month_year: monthYear || new Date().toISOString().slice(0, 7)
          };

      const rankingData = rankingResponse.status === 'fulfilled' && rankingResponse.value.success
        ? rankingResponse.value.data
        : { competition: null, rankings: [] };

      const userPosition = userPositionResponse.status === 'fulfilled' && userPositionResponse.value.success
        ? userPositionResponse.value.data
        : null;

      const statsData = statsResponse.status === 'fulfilled' && statsResponse.value.success
        ? statsResponse.value.data
        : {
            totalParticipants: 0,
            totalPrizePool: 0,
            topPerformers: []
          };

      setData({
        userPoints: userPoints || {
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: monthYear || new Date().toISOString().slice(0, 7)
        },
        competition: rankingData.competition,
        rankings: rankingData.rankings || [],
        userPosition,
        stats: statsData
      });

    } catch (err) {
      logger.error('Erro ao carregar competição mensal', { error: err }, 'MONTHLY_INVITE_HOOK');
      
      // Em caso de erro, definir dados padrão ao invés de erro
      const fallbackData: MonthlyInviteData = {
        userPoints: {
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: monthYear || new Date().toISOString().slice(0, 7)
        },
        competition: null,
        rankings: [],
        userPosition: null,
        stats: {
          totalParticipants: 0,
          totalPrizePool: 0,
          topPerformers: []
        }
      };
      setData(fallbackData);
      setError(null); // Não mostrar erro, apenas dados padrão
      
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
