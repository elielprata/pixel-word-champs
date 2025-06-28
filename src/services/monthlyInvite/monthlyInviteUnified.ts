
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class MonthlyInviteUnifiedService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getMonthlyStats(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Buscando estatísticas mensais unificadas', { targetMonth }, 'MONTHLY_INVITE_UNIFIED_SERVICE');

      const { data, error } = await supabase
        .rpc('get_monthly_invite_stats' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao buscar estatísticas mensais unificadas', { error }, 'MONTHLY_INVITE_UNIFIED_SERVICE');
        throw error;
      }

      // Garantir que configuredPrizes esteja sempre presente na estrutura
      const processedData = {
        ...data,
        stats: {
          ...data?.stats,
          totalParticipants: data?.stats?.totalParticipants || 0,
          totalPrizePool: data?.stats?.totalPrizePool || 0,
          topPerformers: data?.stats?.topPerformers || [],
          configuredPrizes: data?.stats?.configuredPrizes || []
        }
      };

      logger.info('Estatísticas mensais unificadas carregadas', { 
        targetMonth, 
        stats: { 
          totalParticipants: processedData.stats.totalParticipants, 
          totalPrizePool: processedData.stats.totalPrizePool, 
          topPerformersCount: processedData.stats.topPerformers.length,
          configuredPrizesCount: processedData.stats.configuredPrizes.length
        } 
      }, 'MONTHLY_INVITE_UNIFIED_SERVICE');

      return createSuccessResponse(processedData);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais unificadas', { error, monthYear }, 'MONTHLY_INVITE_UNIFIED_SERVICE');
      
      // Retornar dados padrão com estrutura completa em caso de erro
      const fallbackData = {
        competition: null,
        rankings: [],
        stats: {
          totalParticipants: 0,
          totalPrizePool: 0,
          topPerformers: [],
          configuredPrizes: []
        },
        no_active_competition: true,
        has_participants: false
      };
      
      return createSuccessResponse(fallbackData);
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Atualizando ranking mensal', { targetMonth }, 'MONTHLY_INVITE_UNIFIED_SERVICE');

      // Por enquanto, apenas recarregar os dados
      const response = await this.getMonthlyStats(targetMonth);
      
      if (response.success) {
        logger.info('Ranking mensal atualizado', { targetMonth }, 'MONTHLY_INVITE_UNIFIED_SERVICE');
      }
      
      return response;
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error, monthYear }, 'MONTHLY_INVITE_UNIFIED_SERVICE');
      return createErrorResponse('Erro ao atualizar ranking mensal');
    }
  }
}

export const monthlyInviteUnifiedService = new MonthlyInviteUnifiedService();
