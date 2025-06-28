
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

      // Buscar competição do mês
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (compError) {
        logger.error('Erro ao buscar competição para stats', { error: compError }, 'MONTHLY_INVITE_SERVICE');
      }

      let totalParticipants = 0;
      let totalPrizePool = 0;
      let topPerformers: any[] = [];

      if (competition) {
        // Buscar participantes únicos do ranking
        const { data: participants, error: partError } = await supabase
          .from('monthly_invite_rankings')
          .select('user_id')
          .eq('competition_id', competition.id);

        if (!partError && participants) {
          totalParticipants = participants.length;
        }

        // Calcular pool de prêmios total
        const { data: prizes, error: prizeError } = await supabase
          .from('monthly_invite_prizes')
          .select('prize_amount')
          .eq('competition_id', competition.id)
          .eq('active', true);

        if (!prizeError && prizes) {
          totalPrizePool = prizes.reduce((sum, prize) => sum + Number(prize.prize_amount), 0);
        }

        // Buscar top performers
        const { data: topRankings, error: topError } = await supabase
          .from('monthly_invite_rankings')
          .select('username, invite_points, position')
          .eq('competition_id', competition.id)
          .order('position', { ascending: true })
          .limit(3);

        if (!topError && topRankings) {
          topPerformers = topRankings;
        }
      }

      const stats: MonthlyInviteStats = {
        competition,
        totalParticipants,
        totalPrizePool,
        topPerformers
      };

      logger.info('Estatísticas mensais carregadas', { targetMonth, stats: { totalParticipants, totalPrizePool, topPerformersCount: topPerformers.length } }, 'MONTHLY_INVITE_SERVICE');

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
}
