
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      // Buscar competições da tabela custom_competitions com status 'active'
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na query do banco:', error);
        throw error;
      }

      console.log('📊 Resposta bruta do banco:', { data, error });
      console.log('📊 Total de competições challenge ativas encontradas:', data?.length || 0);

      // Converter para o formato esperado
      const competitions = data?.map((comp, index) => {
        console.log(`📋 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          type: comp.competition_type,
          status: comp.status,
          start_date: comp.start_date,
          end_date: comp.end_date
        });

        return {
          id: comp.id,
          title: comp.title,
          description: comp.description || '',
          theme: comp.theme || 'geral',
          start_date: comp.start_date,
          end_date: comp.end_date,
          status: comp.status,
          prize_pool: Number(comp.prize_pool) || 0,
          max_participants: comp.max_participants || 0,
          competition_type: comp.competition_type,
          created_at: comp.created_at,
          updated_at: comp.updated_at
        };
      }) || [];

      return createSuccessResponse(competitions);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias:', error);
      return createErrorResponse(handleServiceError(error, 'DAILY_COMPETITION_GET_ACTIVE'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      // Buscar participações da competição ordenadas por pontuação
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          id,
          user_id,
          total_score,
          completed_at,
          profiles!game_sessions_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .eq('is_completed', true)
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      const ranking = data?.map((session, index) => ({
        position: index + 1,
        user_id: session.user_id,
        username: session.profiles?.username || 'Usuário',
        avatar_url: session.profiles?.avatar_url,
        total_score: session.total_score || 0,
        completed_at: session.completed_at
      })) || [];

      return createSuccessResponse(ranking);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'DAILY_COMPETITION_GET_RANKING'));
    }
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();
