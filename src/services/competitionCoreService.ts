
import { supabase } from '@/integrations/supabase/client';
import { Competition, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export class CompetitionCoreService {
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    try {
      console.log('🔍 Buscando competições ativas na tabela custom_competitions...');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`📊 Competições ativas encontradas: ${data?.length || 0}`);

      const competitions = data?.map(comp => ({
        id: comp.id,
        type: comp.competition_type === 'challenge' ? 'daily' as const : 
              comp.competition_type === 'tournament' ? 'weekly' as const : 'challenge' as const,
        title: comp.title,
        description: comp.description || '',
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status,
        prize_pool: Number(comp.prize_pool) || 0,
        total_participants: 0, // Será calculado conforme necessário
        max_participants: comp.max_participants || 1000,
        is_active: comp.status === 'active',
        created_at: comp.created_at || '',
        updated_at: comp.updated_at || ''
      })) || [];

      console.log('✅ Competições mapeadas com sucesso:', competitions.length);
      console.log('📅 Preservando datas originais das competições mapeadas');
      return createSuccessResponse(competitions);
    } catch (error) {
      console.error('❌ Erro ao buscar competições ativas:', error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_ACTIVE'));
    }
  }

  async getDailyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      console.log('🔍 Buscando competição diária ativa...');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: 'daily',
        title: data.title,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        is_active: data.status === 'active',
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      console.log('✅ Competição diária encontrada:', competition.title);
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao buscar competição diária:', error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_DAILY'));
    }
  }

  async getWeeklyCompetition(): Promise<ApiResponse<Competition>> {
    try {
      console.log('🔍 Buscando competição semanal ativa...');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (error) throw error;

      const competition: Competition = {
        id: data.id,
        type: 'weekly',
        title: data.title,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        is_active: data.status === 'active',
        total_participants: 0,
        max_participants: data.max_participants || 1000,
        prize_pool: Number(data.prize_pool) || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      console.log('✅ Competição semanal encontrada:', competition.title);
      return createSuccessResponse(competition);
    } catch (error) {
      console.error('❌ Erro ao buscar competição semanal:', error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_GET_WEEKLY'));
    }
  }
}

export const competitionCoreService = new CompetitionCoreService();
