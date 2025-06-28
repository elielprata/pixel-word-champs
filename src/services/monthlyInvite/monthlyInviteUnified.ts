
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

      // Usar a função simplificada que agora faz tudo em uma query
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
      
      logger.debug('Atualizando ranking mensal (agora automático)', { targetMonth }, 'MONTHLY_INVITE_UNIFIED');

      // Como a função get_monthly_invite_stats agora calcula tudo dinamicamente,
      // só precisamos chamá-la novamente para "atualizar" os dados
      const result = await this.getMonthlyStats(targetMonth);

      if (result.success) {
        logger.info('Ranking mensal atualizado com sucesso', { targetMonth }, 'MONTHLY_INVITE_UNIFIED');
        return createSuccessResponse('Ranking atualizado com sucesso');
      } else {
        return result;
      }
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_UNIFIED');
      return createErrorResponse(`Erro ao atualizar ranking: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export const monthlyInviteUnifiedService = new MonthlyInviteUnifiedService();
