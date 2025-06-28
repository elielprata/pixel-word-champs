
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
      
      logger.debug('Buscando estatísticas consolidadas da competição mensal', { targetMonth }, 'MONTHLY_INVITE_UNIFIED');

      // Usar a nova função consolidada - seguindo padrão do ranking semanal
      const { data, error } = await supabase
        .rpc('get_monthly_invite_stats' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao buscar estatísticas mensais consolidadas', { error }, 'MONTHLY_INVITE_UNIFIED');
        return createErrorResponse(`Erro ao buscar dados: ${error.message}`);
      }

      logger.info('Estatísticas mensais consolidadas carregadas', { 
        targetMonth, 
        hasCompetition: !!data?.competition,
        rankingsCount: data?.rankings?.length || 0
      }, 'MONTHLY_INVITE_UNIFIED');

      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais consolidadas', { error }, 'MONTHLY_INVITE_UNIFIED');
      return createErrorResponse(`Erro ao buscar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Atualizando ranking mensal', { targetMonth }, 'MONTHLY_INVITE_UNIFIED');

      const { data, error } = await supabase
        .rpc('populate_monthly_invite_ranking' as any, { target_month: targetMonth });

      if (error) {
        logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_UNIFIED');
        return createErrorResponse(`Erro ao atualizar ranking: ${error.message}`);
      }

      logger.info('Ranking mensal atualizado com sucesso', { targetMonth }, 'MONTHLY_INVITE_UNIFIED');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_UNIFIED');
      return createErrorResponse(`Erro ao atualizar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export const monthlyInviteUnifiedService = new MonthlyInviteUnifiedService();
