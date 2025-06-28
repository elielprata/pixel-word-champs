
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class MonthlyInviteCompetitionService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getCurrentMonthCompetition() {
    try {
      const currentMonth = this.getCurrentMonth();
      
      logger.debug('Buscando competição do mês atual', { currentMonth }, 'MONTHLY_INVITE_COMPETITION');

      const { data: competition, error } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', currentMonth)
        .maybeSingle();

      if (error) {
        logger.error('Erro ao buscar competição atual', { error }, 'MONTHLY_INVITE_COMPETITION');
        return createErrorResponse(`Erro ao buscar competição: ${error.message}`);
      }

      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro ao buscar competição atual', { error }, 'MONTHLY_INVITE_COMPETITION');
      return createErrorResponse(`Erro ao buscar competição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Buscando ranking mensal', { targetMonth, limit }, 'MONTHLY_INVITE_COMPETITION');

      // Buscar competição do mês
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (compError) {
        logger.error('Erro ao buscar competição para ranking', { error: compError }, 'MONTHLY_INVITE_COMPETITION');
        return createSuccessResponse({ competition: null, rankings: [] });
      }

      if (!competition) {
        return createSuccessResponse({ competition: null, rankings: [] });
      }

      // Buscar ranking da competição
      const { data: rankings, error: rankingError } = await supabase
        .from('monthly_invite_rankings')
        .select('*')
        .eq('competition_id', competition.id)
        .order('position', { ascending: true })
        .limit(limit);

      if (rankingError) {
        logger.error('Erro ao buscar ranking mensal', { error: rankingError }, 'MONTHLY_INVITE_COMPETITION');
        return createErrorResponse(`Erro ao buscar ranking: ${rankingError.message}`);
      }

      logger.info('Ranking mensal carregado', { 
        competitionId: competition.id, 
        rankingsCount: rankings?.length || 0 
      }, 'MONTHLY_INVITE_COMPETITION');

      return createSuccessResponse({
        competition,
        rankings: rankings || []
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
      return createErrorResponse(`Erro ao buscar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Atualizando ranking mensal', { targetMonth }, 'MONTHLY_INVITE_COMPETITION');

      // Executar função que popula dados e ranking - usar casting para contornar limitação TypeScript
      const { data, error } = await supabase
        .rpc('populate_monthly_invite_ranking' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
        return createErrorResponse(`Erro ao atualizar ranking: ${error.message}`);
      }

      logger.info('Ranking mensal atualizado com sucesso', { targetMonth, data }, 'MONTHLY_INVITE_COMPETITION');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
      return createErrorResponse(`Erro ao atualizar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
