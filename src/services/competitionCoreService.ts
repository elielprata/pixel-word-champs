
import { supabase } from '@/integrations/supabase/client';
import { Competition, CompetitionParticipation, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export class CompetitionCoreService {
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
}

export const competitionCoreService = new CompetitionCoreService();
