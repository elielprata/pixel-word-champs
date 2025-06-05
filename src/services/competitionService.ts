
import { supabase } from '@/integrations/supabase/client';
import { Competition, CompetitionParticipation, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

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
        week_start: comp.week_start || '',
        week_end: comp.week_end || '',
        is_active: comp.is_active || false,
        total_participants: comp.total_participants || 0,
        prize_pool: Number(comp.prize_pool) || 0,
        created_at: comp.created_at || '',
        updated_at: comp.updated_at || ''
      })) || [];

      return createSuccessResponse(competitions);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_ACTIVE'));
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
        week_start: data.week_start || '',
        week_end: data.week_end || '',
        is_active: data.is_active || false,
        total_participants: data.total_participants || 0,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      return createSuccessResponse(competition);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_DAILY'));
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
        week_start: data.week_start || '',
        week_end: data.week_end || '',
        is_active: data.is_active || false,
        total_participants: data.total_participants || 0,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      return createSuccessResponse(competition);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_WEEKLY'));
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
        competition_id: data.competition_id || '',
        user_id: data.user_id || '',
        user_position: data.user_position || 0,
        user_score: data.user_score || 0,
        prize: data.prize ? Number(data.prize) : undefined,
        payment_status: data.payment_status as 'pending' | 'paid' | 'not_eligible' || 'pending',
        payment_date: data.payment_date || undefined
      };

      return createSuccessResponse(participation);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_JOIN'));
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

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'COMPETITION_RANKING'));
    }
  }
}

export const competitionService = new CompetitionService();
