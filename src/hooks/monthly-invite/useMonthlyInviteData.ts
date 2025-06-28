
import { useCallback, useRef } from 'react';
import { monthlyInviteService } from '@/services/monthlyInvite';
import { useAuth } from '../useAuth';
import { logger } from '@/utils/logger';
import { MonthlyInviteData } from './types';

export const useMonthlyInviteData = () => {
  const { isAuthenticated, user } = useAuth();
  const abortControllerRef = useRef<AbortController>();

  const loadData = useCallback(async (monthYear?: string): Promise<MonthlyInviteData> => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      logger.debug('Carregando dados da competição mensal', { userId: user?.id, monthYear }, 'MONTHLY_INVITE_HOOK');

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
        return defaultData;
      }

      // Carregar todos os dados em paralelo com melhor tratamento de erros
      const [userPointsResponse, rankingResponse, userPositionResponse, statsResponse] = await Promise.allSettled([
        monthlyInviteService.getUserMonthlyPoints(user.id, monthYear),
        monthlyInviteService.getMonthlyRanking(monthYear),
        monthlyInviteService.getUserMonthlyPosition(user.id, monthYear),
        monthlyInviteService.getMonthlyStats(monthYear)
      ]);

      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request aborted');
      }

      // Processar resultados com fallbacks seguros - NUNCA falhar por dados ausentes
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
            competition: null,
            totalParticipants: 0,
            totalPrizePool: 0,
            topPerformers: []
          };

      // Helper function to validate userPoints structure
      const isValidUserPoints = (data: any): data is { invite_points: number; invites_count: number; active_invites_count: number; month_year: string } => {
        return data && 
               typeof data === 'object' && 
               typeof data.invite_points === 'number' &&
               typeof data.invites_count === 'number' &&
               typeof data.active_invites_count === 'number' &&
               typeof data.month_year === 'string';
      };

      const finalData: MonthlyInviteData = {
        userPoints: isValidUserPoints(userPoints) ? userPoints : {
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

      // Verificar novamente se não foi cancelada antes de retornar
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request aborted');
      }

      // Só logar sucesso quando há dados relevantes
      if (finalData.userPoints.invite_points > 0 || finalData.rankings.length > 0) {
        logger.info('Dados da competição mensal carregados com sucesso', { 
          userId: user.id, 
          hasCompetition: !!finalData.competition,
          rankingsCount: finalData.rankings.length,
          userPoints: finalData.userPoints.invite_points
        }, 'MONTHLY_INVITE_HOOK');
      }

      return finalData;

    } catch (err) {
      // Só processar erro se não foi cancelada E se é um erro real (não dados ausentes)
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        
        // Só mostrar erro na UI se for um erro de rede/sistema, não ausência de dados
        if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          logger.error('Erro de rede ao carregar competição mensal', { error: err, userId: user?.id }, 'MONTHLY_INVITE_HOOK');
          throw new Error('Erro de conexão. Tente novamente.');
        } else if (errorMsg === 'Request aborted') {
          throw err;
        } else {
          // Para outros erros, criar dados padrão sem mostrar erro
          logger.debug('Dados não encontrados, usando padrão', { error: err, userId: user?.id }, 'MONTHLY_INVITE_HOOK');
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
          return defaultData;
        }
      } else {
        throw err;
      }
    }
  }, [isAuthenticated, user?.id]);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { loadData, cleanup };
};
