
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class MonthlyInviteCoreService {
  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getUserMonthlyPoints(userId?: string, monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      // Se não há userId, retornar dados padrão sem log desnecessário
      if (!userId) {
        return createSuccessResponse({
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: targetMonth
        });
      }

      // Primeiro, tentar buscar da tabela monthly_invite_points
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_invite_points')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', targetMonth)
        .maybeSingle();

      // Se encontrou dados na tabela, usar eles
      if (monthlyData && !monthlyError) {
        return createSuccessResponse({
          invite_points: monthlyData.invite_points,
          invites_count: monthlyData.invites_count,
          active_invites_count: monthlyData.active_invites_count,
          month_year: monthlyData.month_year
        });
      }

      // Se não encontrou, calcular baseado na tabela invites com join otimizado
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select(`
          *,
          profiles!used_by (
            id,
            games_played
          )
        `)
        .eq('invited_by', userId)
        .not('used_by', 'is', null);

      if (invitesError) {
        logger.error('Erro ao buscar convites do usuário', { error: invitesError, userId }, 'MONTHLY_INVITE_SERVICE');
        throw invitesError;
      }

      // Filtrar convites do mês atual baseado na data de uso
      const currentMonthInvites = (invitesData || []).filter(invite => {
        if (!invite.used_at) return false;
        const inviteDate = new Date(invite.used_at);
        const inviteMonth = `${inviteDate.getFullYear()}-${String(inviteDate.getMonth() + 1).padStart(2, '0')}`;
        return inviteMonth === targetMonth;
      });

      // Contar convites ativos (usuários que jogaram pelo menos 1 jogo)
      const activeInvites = currentMonthInvites.filter(invite => {
        const profile = invite.profiles as any;
        return profile?.games_played > 0;
      });

      const result = {
        invite_points: activeInvites.length * 50, // 50 pontos por convite ativo
        invites_count: currentMonthInvites.length,
        active_invites_count: activeInvites.length,
        month_year: targetMonth
      };

      // Log apenas quando relevante (quando há dados ou erro)
      if (result.invite_points > 0 || result.invites_count > 0) {
        logger.debug('Pontos mensais calculados', { userId, targetMonth, result }, 'MONTHLY_INVITE_SERVICE');
      }

      return createSuccessResponse(result);

    } catch (error) {
      logger.error('Erro ao buscar pontos mensais', { error, userId, monthYear }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(`Erro ao buscar pontos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getUserMonthlyPosition(userId?: string, monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      if (!userId) {
        return createSuccessResponse(null);
      }

      // Primeiro buscar a competição do mês
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('id')
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (compError || !competition) {
        return createSuccessResponse(null);
      }

      // Verificar se existe ranking na tabela monthly_invite_rankings
      const { data: rankingData, error: rankingError } = await supabase
        .from('monthly_invite_rankings')
        .select('position, prize_amount')
        .eq('user_id', userId)
        .eq('competition_id', competition.id)
        .maybeSingle();

      if (rankingError || !rankingData) {
        return createSuccessResponse(null);
      }

      // Log apenas quando encontrar posição
      logger.debug('Posição mensal encontrada', { userId, position: rankingData.position }, 'MONTHLY_INVITE_SERVICE');
      
      return createSuccessResponse({
        position: rankingData.position,
        prize_amount: rankingData.prize_amount
      });

    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { error, userId }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse(null);
    }
  }
}
