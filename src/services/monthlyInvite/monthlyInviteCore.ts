
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class MonthlyInviteCoreService {
  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getUserMonthlyPoints(userId?: string, monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      // Se não há userId, retornar dados padrão
      if (!userId) {
        return createSuccessResponse({
          invite_points: 0,
          invites_count: 0,
          active_invites_count: 0,
          month_year: targetMonth
        });
      }

      // Primeiro, tentar buscar da tabela monthly_invite_points se existir
      let { data, error } = await supabase
        .from('monthly_invite_points')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', targetMonth)
        .maybeSingle();

      if (error) {
        logger.warn('Tabela monthly_invite_points não existe, calculando diretamente', { error }, 'MONTHLY_INVITE_SERVICE');
        
        // Fallback: calcular baseado na tabela invites
        const { data: invitesData, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .eq('invited_by', userId)
          .not('used_by', 'is', null);

        if (invitesError) {
          throw invitesError;
        }

        // Filtrar convites do mês atual
        const currentMonthInvites = (invitesData || []).filter(invite => {
          const inviteDate = new Date(invite.created_at);
          const inviteMonth = `${inviteDate.getFullYear()}-${String(inviteDate.getMonth() + 1).padStart(2, '0')}`;
          return inviteMonth === targetMonth;
        });

        data = {
          invite_points: currentMonthInvites.length * 50,
          invites_count: currentMonthInvites.length,
          active_invites_count: currentMonthInvites.length,
          month_year: targetMonth
        };
      }

      const result = data || {
        invite_points: 0,
        invites_count: 0,
        active_invites_count: 0,
        month_year: targetMonth
      };

      return createSuccessResponse(result);
    } catch (error) {
      logger.error('Erro ao buscar pontos mensais', { error }, 'MONTHLY_INVITE_SERVICE');
      // Retornar dados padrão em caso de erro
      return createSuccessResponse({
        invite_points: 0,
        invites_count: 0,
        active_invites_count: 0,
        month_year: monthYear || this.getCurrentMonth()
      });
    }
  }

  async getUserMonthlyPosition(userId?: string, monthYear?: string) {
    try {
      // Por enquanto, retornar null (usuário não está no ranking)
      return createSuccessResponse(null);
    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { error }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse(null);
    }
  }
}
