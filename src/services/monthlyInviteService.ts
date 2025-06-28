
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
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (!targetUserId) {
        return createErrorResponse('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('monthly_invite_points')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('month_year', targetMonth)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
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
      return createErrorResponse(handleServiceError(error, 'getUserMonthlyPoints'));
    }
  }

  async getCurrentMonthCompetition() {
    try {
      const currentMonth = this.getCurrentMonth();

      const { data, error } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao buscar competição mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getCurrentMonthCompetition'));
    }
  }

  async getMonthlyRanking(monthYear?: string, limit = 100) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      // First ensure the competition exists and ranking is calculated
      const { error: calcError } = await supabase.rpc('calculate_monthly_invite_ranking', {
        target_month: targetMonth
      });

      if (calcError) {
        logger.error('Erro ao calcular ranking mensal', { error: calcError }, 'MONTHLY_INVITE_SERVICE');
      }

      // Get competition
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .single();

      if (compError) {
        throw compError;
      }

      // Get ranking
      const { data: rankings, error: rankError } = await supabase
        .from('monthly_invite_rankings')
        .select('*')
        .eq('competition_id', competition.id)
        .order('position', { ascending: true })
        .limit(limit);

      if (rankError) {
        throw rankError;
      }

      return createSuccessResponse({
        competition,
        rankings: rankings || []
      });
    } catch (error) {
      logger.error('Erro ao buscar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getMonthlyRanking'));
    }
  }

  async getUserMonthlyPosition(userId?: string, monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (!targetUserId) {
        return createErrorResponse('Usuário não autenticado');
      }

      // Get competition
      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .single();

      if (compError) {
        throw compError;
      }

      // Get user ranking
      const { data: userRanking, error: rankError } = await supabase
        .from('monthly_invite_rankings')
        .select('*')
        .eq('competition_id', competition.id)
        .eq('user_id', targetUserId)
        .single();

      if (rankError && rankError.code !== 'PGRST116') {
        throw rankError;
      }

      return createSuccessResponse(userRanking);
    } catch (error) {
      logger.error('Erro ao buscar posição do usuário', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getUserMonthlyPosition'));
    }
  }

  async getMonthlyStats(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      const { data: competition, error: compError } = await supabase
        .from('monthly_invite_competitions')
        .select('*')
        .eq('month_year', targetMonth)
        .single();

      if (compError && compError.code !== 'PGRST116') {
        throw compError;
      }

      if (!competition) {
        return createSuccessResponse({
          competition: null,
          totalParticipants: 0,
          totalPrizePool: 0,
          topPerformers: []
        });
      }

      const { data: topPerformers, error: topError } = await supabase
        .from('monthly_invite_rankings')
        .select('username, invite_points, active_invites_count, position')
        .eq('competition_id', competition.id)
        .order('position', { ascending: true })
        .limit(3);

      if (topError) {
        throw topError;
      }

      return createSuccessResponse({
        competition,
        totalParticipants: competition.total_participants,
        totalPrizePool: competition.total_prize_pool,
        topPerformers: topPerformers || []
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas mensais', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'getMonthlyStats'));
    }
  }

  async refreshMonthlyRanking(monthYear?: string) {
    try {
      const targetMonth = monthYear || this.getCurrentMonth();

      const { data, error } = await supabase.rpc('calculate_monthly_invite_ranking', {
        target_month: targetMonth
      });

      if (error) {
        throw error;
      }

      logger.info('Ranking mensal atualizado', { targetMonth, result: data }, 'MONTHLY_INVITE_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao atualizar ranking mensal', { error }, 'MONTHLY_INVITE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'refreshMonthlyRanking'));
    }
  }
}

export const monthlyInviteService = new MonthlyInviteService();
