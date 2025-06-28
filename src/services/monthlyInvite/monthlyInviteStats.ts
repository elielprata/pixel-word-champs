
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

      // Primeiro, garantir que os dados estão atualizados
      await this.updateMonthlyData(targetMonth);

      // Buscar competição do mês
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (compError) {
        logger.error('Erro ao buscar competição para stats', { error: compError }, 'MONTHLY_INVITE_SERVICE');
        // Não retornar erro, criar dados padrão
      }

      let totalParticipants = 0;
      let totalPrizePool = 0;
      let topPerformers: any[] = [];

      if (competition) {
        // Usar os dados já calculados e armazenados na competição
        totalParticipants = competition.total_participants || 0;
        totalPrizePool = Number(competition.total_prize_pool) || 0;

        // Buscar top performers do ranking
        const { data: topRankings, error: topError } = await supabase
          .from('monthly_invite_rankings')
          .select('username, invite_points, position')
          .eq('competition_id', competition.id)
          .order('position', { ascending: true })
          .limit(3);

        if (!topError && topRankings && topRankings.length > 0) {
          topPerformers = topRankings;
        }
      }

      // Cast competition status to proper type
      const competitionWithProperStatus = competition ? {
        ...competition,
        status: competition.status as 'scheduled' | 'active' | 'completed'
      } : null;

      const stats: MonthlyInviteStats = {
        competition: competitionWithProperStatus,
        totalParticipants,
        totalPrizePool,
        topPerformers
      };

      // Só logar quando há dados relevantes
      if (totalParticipants > 0 || totalPrizePool > 0) {
        logger.info('Estatísticas mensais carregadas', { 
          targetMonth, 
          stats: { totalParticipants, totalPrizePool, topPerformersCount: topPerformers.length } 
        }, 'MONTHLY_INVITE_SERVICE');
      }

      return createSuccessResponse(stats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais', { error, monthYear }, 'MONTHLY_INVITE_SERVICE');
      
      // Retornar dados padrão em caso de erro para não quebrar a UI
      const fallbackStats: MonthlyInviteStats = {
        competition: null,
        totalParticipants: 0,
        totalPrizePool: 0,
        topPerformers: []
      };
      
      return createSuccessResponse(fallbackStats);
    }
  }

  private async updateMonthlyData(targetMonth: string) {
    try {
      // Executar função que atualiza dados mensais baseado nos convites reais
      const { data, error } = await supabase
        .rpc('populate_monthly_competition_and_points', { target_month: targetMonth });

      if (error) {
        logger.warn('Erro ao atualizar dados mensais', { error, targetMonth }, 'MONTHLY_INVITE_SERVICE');
        return;
      }

      // Executar função que popula o ranking
      const { data: rankingData, error: rankingError } = await supabase
        .rpc('populate_monthly_invite_ranking', { target_month: targetMonth });

      if (rankingError) {
        logger.warn('Erro ao atualizar ranking mensal', { error: rankingError, targetMonth }, 'MONTHLY_INVITE_SERVICE');
        return;
      }

      logger.debug('Dados mensais atualizados com sucesso', { targetMonth, data, rankingData }, 'MONTHLY_INVITE_SERVICE');
    } catch (error) {
      logger.warn('Erro ao atualizar dados mensais', { error, targetMonth }, 'MONTHLY_INVITE_SERVICE');
    }
  }
}
