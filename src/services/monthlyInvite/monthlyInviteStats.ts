
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { MonthlyInviteStats } from '@/types/monthlyInvite';

export class MonthlyInviteStatsService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getMonthlyStats(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Buscando estatísticas mensais', { targetMonth }, 'MONTHLY_INVITE_SERVICE');

      // Usar a função atualizada que inclui prêmios configurados
      const { data, error } = await supabase
        .rpc('get_monthly_invite_stats' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao buscar estatísticas mensais', { error }, 'MONTHLY_INVITE_SERVICE');
        throw error;
      }

      // Transformar os dados para o formato esperado
      const stats: MonthlyInviteStats = {
        competition: data?.competition || null,
        totalParticipants: data?.stats?.totalParticipants || 0,
        totalPrizePool: data?.stats?.totalPrizePool || 0,
        topPerformers: data?.stats?.topPerformers || [],
        configuredPrizes: data?.stats?.configuredPrizes || []
      };

      logger.info('Estatísticas mensais carregadas', { 
        targetMonth, 
        stats: { 
          totalParticipants: stats.totalParticipants, 
          totalPrizePool: stats.totalPrizePool, 
          topPerformersCount: stats.topPerformers.length,
          configuredPrizesCount: stats.configuredPrizes?.length || 0
        } 
      }, 'MONTHLY_INVITE_SERVICE');

      return createSuccessResponse(stats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais', { error, monthYear }, 'MONTHLY_INVITE_SERVICE');
      
      // Retornar dados padrão em caso de erro para não quebrar a UI
      const fallbackStats: MonthlyInviteStats = {
        competition: null,
        totalParticipants: 0,
        totalPrizePool: 0,
        topPerformers: [],
        configuredPrizes: []
      };
      
      return createSuccessResponse(fallbackStats);
    }
  }
}
