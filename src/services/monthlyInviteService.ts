
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface MonthlyInvitePoints {
  id: string;
  user_id: string;
  month_year: string;
  invite_points: number;
  invites_count: number;
  active_invites_count: number;
  last_updated: string;
  created_at: string;
}

export interface MonthlyInviteCompetition {
  id: string;
  month_year: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'completed';
  total_participants: number;
  total_prize_pool: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyInviteRanking {
  id: string;
  competition_id: string;
  user_id: string;
  username: string;
  position: number;
  invite_points: number;
  invites_count: number;
  active_invites_count: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
  pix_holder_name?: string;
}

class MonthlyInviteService {
  private getCurrentMonth(): string {
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

  async getCurrentMonthCompetition() {
    try {
      const currentMonth = this.getCurrentMonth();

      // Simular competição se a tabela não existir
      const mockCompetition = {
        id: 'mock-competition',
        month_year: currentMonth,
        title: `Competição de Indicações ${currentMonth}`,
        description: 'Competição mensal baseada em indicações de amigos',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: 'active' as const,
        total_participants: 0,
        total_prize_pool: 1100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return createSuccessResponse(mockCompetition);
    } catch (error) {
      logger.error('Erro ao buscar competição mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse('Erro ao buscar competição');
    }
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      // Simular dados de competição e ranking
      const mockCompetition = {
        id: 'mock-competition',
        month_year: targetMonth,
        title: `Competição de Indicações ${targetMonth}`,
        status: 'active',
        total_participants: 0,
        total_prize_pool: 1100
      };

      const mockRankings: any[] = [];

      return createSuccessResponse({
        competition: mockCompetition,
        rankings: mockRankings
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({
        competition: null,
        rankings: []
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

  async getMonthlyStats(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      const mockStats = {
        competition: {
          id: 'mock-competition',
          month_year: targetMonth,
          status: 'active'
        },
        totalParticipants: 0,
        totalPrizePool: 1100,
        topPerformers: []
      };

      return createSuccessResponse(mockStats);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais', { error }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({
        competition: null,
        totalParticipants: 0,
        totalPrizePool: 0,
        topPerformers: []
      });
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      
      // Simular atualização bem-sucedida
      logger.info('Ranking mensal simulado', { targetMonth }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse({ success: true, month: targetMonth });
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse('Erro ao atualizar ranking');
    }
  }
}

export const monthlyInviteService = new MonthlyInviteService();
