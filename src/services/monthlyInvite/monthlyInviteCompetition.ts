
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
      
      logger.debug('Buscando ranking mensal via função simplificada', { targetMonth, limit }, 'MONTHLY_INVITE_COMPETITION');

      // Usar a função simplificada
      const { data, error } = await supabase
        .rpc('get_monthly_invite_stats' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
        return createErrorResponse(`Erro ao buscar ranking: ${error.message}`);
      }

      // Limitar resultados se necessário
      const rankings = data?.rankings ? data.rankings.slice(0, limit) : [];

      logger.info('Ranking mensal carregado', { 
        competitionId: data?.competition?.id, 
        rankingsCount: rankings.length 
      }, 'MONTHLY_INVITE_COMPETITION');

      return createSuccessResponse({
        competition: data?.competition || null,
        rankings
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
      return createErrorResponse(`Erro ao buscar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Ranking agora é calculado dinamicamente', { targetMonth }, 'MONTHLY_INVITE_COMPETITION');

      // Como tudo é calculado dinamicamente, só precisamos buscar os dados atualizados
      const result = await this.getMonthlyRanking(targetMonth);
      
      if (result.success) {
        logger.info('Ranking mensal "atualizado" (dados dinâmicos)', { targetMonth }, 'MONTHLY_INVITE_COMPETITION');
        return createSuccessResponse('Ranking atualizado com sucesso');
      } else {
        return result;
      }
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_COMPETITION');
      return createErrorResponse(`Erro ao atualizar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
