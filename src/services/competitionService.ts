
import { supabase } from '@/integrations/supabase/client';
import { Competition, CompetitionParticipation, ApiResponse } from '@/types';

class CompetitionService {
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const competitions = data?.map(comp => ({
        id: comp.id,
        type: comp.type as 'daily' | 'weekly' | 'challenge',
        title: comp.title,
        description: comp.description || '',
        weekStart: comp.week_start || '',
        weekEnd: comp.week_end || '',
        isActive: comp.is_active || false,
        totalParticipants: comp.total_participants || 0,
        prizePool: Number(comp.prize_pool) || 0,
        prizeDistribution: [], // Será preenchido em outra query se necessário
        createdAt: comp.created_at || ''
      })) || [];

      return {
        success: true,
        data: competitions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar competições'
      };
    }
  }

  async getDailyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('type', 'daily')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: data.type as 'daily' | 'weekly' | 'challenge',
        title: data.title,
        description: data.description || '',
        weekStart: data.week_start || '',
        weekEnd: data.week_end || '',
        isActive: data.is_active || false,
        totalParticipants: data.total_participants || 0,
        prizePool: Number(data.prize_pool) || 0,
        prizeDistribution: [],
        createdAt: data.created_at || ''
      };

      return {
        success: true,
        data: competition
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar competição diária'
      };
    }
  }

  async getWeeklyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('type', 'weekly')
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: data.type as 'daily' | 'weekly' | 'challenge',
        title: data.title,
        description: data.description || '',
        weekStart: data.week_start || '',
        weekEnd: data.week_end || '',
        isActive: data.is_active || false,
        totalParticipants: data.total_participants || 0,
        prizePool: Number(data.prize_pool) || 0,
        prizeDistribution: [],
        createdAt: data.created_at || ''
      };

      return {
        success: true,
        data: competition
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar competição semanal'
      };
    }
  }

  async joinCompetition(competitionId: string): Promise<ApiResponse<CompetitionParticipation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0
        })
        .select()
        .single();

      if (error) throw error;

      const participation: CompetitionParticipation = {
        id: data.id,
        competitionId: data.competition_id || '',
        userId: data.user_id || '',
        userPosition: data.user_position || 0,
        userScore: data.user_score || 0,
        prize: data.prize ? Number(data.prize) : undefined,
        paymentStatus: data.payment_status as 'pending' | 'paid' | 'not_eligible' || 'pending',
        paymentDate: data.payment_date || undefined
      };

      return {
        success: true,
        data: participation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao entrar na competição'
      };
    }
  }

  async getCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .select(`
          user_position,
          user_score,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar ranking'
      };
    }
  }
}

export const competitionService = new CompetitionService();
