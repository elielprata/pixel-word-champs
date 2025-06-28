
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
      logger.debug('Iniciando carregamento de dados da competição mensal', { userId: user?.id, monthYear }, 'MONTHLY_INVITE_HOOK');

      // Se não estiver autenticado, criar dados padrão
      if (!isAuthenticated || !user?.id) {
        logger.info('Usuário não autenticado, retornando dados padrão', undefined, 'MONTHLY_INVITE_HOOK');
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

      // Carregar todos os dados em paralelo
      const [userPointsResponse, rankingResponse, userPositionResponse, statsResponse] = await Promise.allSettled([
        monthlyInviteService.getUserMonthlyPoints(user.id, monthYear),
        monthlyInviteService.getMonthlyRanking(monthYear),
        monthlyInviteService.getUserMonthlyPosition(user.id, monthYear),
        monthlyInviteService.getMonthlyStats(monthYear)
      ]);

      // Processar resultados e log de erros específicos
      const userPoints = userPointsResponse.status === 'fulfilled' && userPointsResponse.value.success
        ? userPointsResponse.value.data
        : {
            invite_points: 0,
            invites_count: 0,
            active_invites_count: 0,
            month_year: monthYear || new Date().toISOString().slice(0, 7)
          };

      if (userPointsResponse.status === 'rejected' || (userPointsResponse.status === 'fulfilled' && !userPointsResponse.value.success)) {
        const errorMsg = userPointsResponse.status === 'rejected' 
          ? userPointsResponse.reason 
          : (userPointsResponse.status === 'fulfilled' ? userPointsResponse.value.error : 'Erro desconhecido');
        logger.warn('Erro ao carregar pontos do usuário', { error: errorMsg }, 'MONTHLY_INVITE_HOOK');
      }

      const rankingData = rankingResponse.status === 'fulfilled' && rankingResponse.value.success
        ? rankingResponse.value.data
        : { competition: null, rankings: [] };

      if (rankingResponse.status === 'rejected' || (rankingResponse.status === 'fulfilled' && !rankingResponse.value.success)) {
        const errorMsg = rankingResponse.status === 'rejected' 
          ? rankingResponse.reason 
          : (rankingResponse.status === 'fulfilled' ? rankingResponse.value.error : 'Erro desconhecido');
        logger.warn('Erro ao carregar ranking', { error: errorMsg }, 'MONTHLY_INVITE_HOOK');
      }

      const userPosition = userPositionResponse.status === 'fulfilled' && userPositionResponse.value.success
        ? userPositionResponse.value.data
        : null;

      const statsData = statsResponse.status === 'fulfilled' && statsResponse.value.success
        ? statsResponse.value.data
        : {
            competition: null,
            totalParticipants: 0,
            totalPrizePool: 0,
            topPerformers: []
          };

      if (statsResponse.status === 'rejected' || (statsResponse.status === 'fulfilled' && !statsResponse.value.success)) {
        const errorMsg = statsResponse.status === 'rejected' 
          ? statsResponse.reason 
          : (statsResponse.status === 'fulfilled' ? statsResponse.value.error : 'Erro desconhecido');
        logger.warn('Erro ao carregar estatísticas', { error: errorMsg }, 'MONTHLY_INVITE_HOOK');
      }

      const finalData: MonthlyInviteData = {
        userPoints: userPoints && typeof userPoints === 'object' && 'invite_points' in userPoints ? userPoints : {
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: monthYear || new Date().toISOString().slice(0, 7)
        },
        competition: (rankingData as any)?.competition || null,
        rankings: (rankingData as any)?.rankings || [],
        userPosition,
        stats: {
          totalParticipants: (statsData as any)?.totalParticipants || 0,
          totalPrizePool: (statsData as any)?.totalPrizePool || 0,
          topPerformers: (statsData as any)?.topPerformers || []
        }
      };

      logger.info('Dados da competição mensal carregados com sucesso', { 
        userId: user.id, 
        hasCompetition: !!finalData.competition,
        rankingsCount: finalData.rankings.length,
        userPoints: finalData.userPoints.invite_points
      }, 'MONTHLY_INVITE_HOOK');

      setData(finalData);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('Erro crítico ao carregar competição mensal', { error: err, userId: user?.id }, 'MONTHLY_INVITE_HOOK');
      setError(errorMsg);
      
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRanking = async () => {
    try {
      logger.debug('Atualizando ranking mensal', { monthYear }, 'MONTHLY_INVITE_HOOK');
      const response = await monthlyInviteService.refreshMonthlyRanking(monthYear);
      if (response.success) {
        await loadData(); // Recarregar todos os dados
        logger.info('Ranking atualizado e dados recarregados', undefined, 'MONTHLY_INVITE_HOOK');
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
