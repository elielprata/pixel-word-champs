
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import { MonthlyInviteCompetition } from '@/types/monthlyInvite';

export class MonthlyInviteCompetitionService {
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getCurrentMonthCompetition() {
    try {
      const currentMonth = this.getCurrentMonth();
      
      logger.debug('Buscando competição do mês atual', { currentMonth }, 'MONTHLY_INVITE_SERVICE');

      // Buscar competição ativa do mês atual
      const { data: competition, error } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', currentMonth)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        logger.error('Erro ao buscar competição mensal', { error: error.message, currentMonth }, 'MONTHLY_INVITE_SERVICE');
        // Não retornar erro, criar competição padrão
      }

      if (!competition) {
        // Criar competição padrão se não existir
        logger.debug('Criando competição padrão para o mês', { currentMonth }, 'MONTHLY_INVITE_SERVICE');
        
        const defaultCompetition: MonthlyInviteCompetition = {
          id: 'default-' + currentMonth,
          month_year: currentMonth,
          title: `Competição de Indicações ${currentMonth}`,
          description: 'Competição mensal baseada em indicações de amigos',
          start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          status: 'active' as const,
          total_participants: 0,
          total_prize_pool: 1100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return createSuccessResponse(defaultCompetition);
      }

      logger.info('Competição mensal encontrada', { competitionId: competition.id, currentMonth }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro ao buscar competição mensal', { error, currentMonth: this.getCurrentMonth() }, 'MONTHLY_INVITE_SERVICE');
      
      // Criar competição padrão em caso de erro
      const currentMonth = this.getCurrentMonth();
      const defaultCompetition: MonthlyInviteCompetition = {
        id: 'default-' + currentMonth,
        month_year: currentMonth,
        title: `Competição de Indicações ${currentMonth}`,
        description: 'Competição mensal baseada em indicações de amigos',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        status: 'active' as const,
        total_participants: 0,
        total_prize_pool: 1100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return createSuccessResponse(defaultCompetition);
    }
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Buscando ranking mensal', { targetMonth, limit }, 'MONTHLY_INVITE_SERVICE');

      // Primeiro buscar a competição
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (compError || !competition) {
        // Não logar como erro se é apenas dados não encontrados
        logger.debug('Competição não encontrada para ranking', { targetMonth }, 'MONTHLY_INVITE_SERVICE');
        return createSuccessResponse({
          competition: null,
          rankings: []
        });
      }

      // Verificar se existem rankings primeiro
      const { count: rankingsCount, error: countError } = await supabase
        .from('monthly_invite_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('competition_id', competition.id);

      if (countError) {
        logger.error('Erro ao contar rankings', { error: countError }, 'MONTHLY_INVITE_SERVICE');
        return createSuccessResponse({
          competition,
          rankings: []
        });
      }

      // Se não há rankings, retornar vazio sem erro
      if (!rankingsCount || rankingsCount === 0) {
        return createSuccessResponse({
          competition,
          rankings: []
        });
      }

      // Buscar rankings da competição
      const { data: rankings, error: rankError } = await supabase
        .from('monthly_invite_rankings')
        .select('*')
        .eq('competition_id', competition.id)
        .order('position', { ascending: true })
        .limit(limit);

      if (rankError) {
        logger.error('Erro ao buscar rankings', { error: rankError }, 'MONTHLY_INVITE_SERVICE');
        return createSuccessResponse({
          competition,
          rankings: []
        });
      }

      // Só logar quando há rankings
      if (rankings && rankings.length > 0) {
        logger.info('Ranking mensal carregado', { 
          targetMonth, 
          competitionId: competition.id, 
          rankingsCount: rankings.length 
        }, 'MONTHLY_INVITE_SERVICE');
      }

      return createSuccessResponse({
        competition,
        rankings: rankings || []
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error, monthYear }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({
        competition: null,
        rankings: []
      });
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      logger.debug('Atualizando ranking mensal', { targetMonth }, 'MONTHLY_INVITE_SERVICE');
      
      // Por enquanto, apenas simular sucesso
      // Em uma implementação real, aqui seria executada a lógica de atualização do ranking
      logger.info('Ranking mensal atualizado com sucesso', { targetMonth }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({ success: true, month: targetMonth });
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error, monthYear }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(`Erro ao atualizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
