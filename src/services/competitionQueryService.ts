
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { getBrasiliaTime } from '@/utils/brasiliaTime';

export class CompetitionQueryService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      const brasiliaTime = getBrasiliaTime();
      console.log('📅 Data atual de Brasília:', brasiliaTime.toISOString());

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active');

      console.log('📊 Resposta bruta do banco:', { data, error });

      if (error) {
        console.error('❌ Erro na consulta SQL:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ Nenhum dado retornado do banco');
        return createSuccessResponse([]);
      }

      console.log(`📊 Total de competições challenge ativas encontradas: ${data.length}`);
      
      data.forEach((comp, index) => {
        console.log(`📋 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          type: comp.competition_type,
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
      console.log('📊 Buscando ranking da competição diária:', competitionId);
      
      if (!competitionId) {
        console.error('❌ ID da competição não fornecido');
        return createErrorResponse('ID da competição é obrigatório');
      }

      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_position, user_score, user_id, created_at')
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true })
        .limit(100);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('📊 Nenhuma participação encontrada para a competição');
        return createSuccessResponse([]);
      }

      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      const rankingData = participations.map(participation => {
        const profile = profiles?.find(p => p.id === participation.user_id);
        return {
          ...participation,
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

export const competitionQueryService = new CompetitionQueryService();
