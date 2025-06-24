
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas...');

      // Buscar apenas competições diárias ativas
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active');

      if (error) {
        console.error('❌ Erro na consulta SQL:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ Nenhum dado retornado do banco');
        return createSuccessResponse([]);
      }

      console.log(`✅ Total de competições diárias ativas encontradas: ${data.length}`);
      
      // Log detalhado de cada competição encontrada
      data.forEach((comp, index) => {
        console.log(`📋 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          status: comp.status,
          start_date: comp.start_date,
          end_date: comp.end_date
        });
      });

      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando ranking para competição diária:', competitionId);
      
      if (!competitionId) {
        console.error('❌ ID da competição não fornecido');
        return createErrorResponse('ID da competição é obrigatório');
      }

      // Para competições diárias independentes, buscar participações diretas
      const { data: participations, error: participationsError } = await supabase
        .from('game_sessions')
        .select('user_id, total_score, started_at')
        .eq('competition_id', competitionId)
        .eq('is_completed', true)
        .order('total_score', { ascending: false })
        .limit(100);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('📊 Nenhuma participação encontrada para a competição');
        return createSuccessResponse([]);
      }

      // Buscar perfis dos usuários
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Combinar dados e adicionar posições
      const rankingData = participations.map((participation, index) => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        return {
          user_id: participation.user_id,
          user_score: participation.total_score,
          user_position: index + 1,
          created_at: participation.started_at,
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url
          } : null
        };
      });

      console.log('✅ Ranking da competição diária carregado:', rankingData.length);
      return createSuccessResponse(rankingData);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITION_RANKING'));
    }
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();
