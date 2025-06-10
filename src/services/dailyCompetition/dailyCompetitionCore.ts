
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

export class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando TODAS as competições diárias ativas...');

      // Buscar todas as competições diárias ativas, independente de vinculação semanal
      const { data, error } = await supabase
        .from('custom_competitions')
        .select(`
          *,
          weekly_competition:custom_competitions!weekly_tournament_id(
            id,
            title,
            status,
            start_date,
            end_date
          )
        `)
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
          end_date: comp.end_date,
          hasWeeklyLink: !!comp.weekly_tournament_id,
          weeklyStatus: comp.weekly_competition?.status || 'N/A'
        });
      });

      // Retornar todas as competições ativas (não filtrar por vinculação semanal)
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias ativas:', error);
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('📊 Buscando ranking da competição diária (transferido para semanal):', competitionId);
      
      if (!competitionId) {
        console.error('❌ ID da competição não fornecido');
        return createErrorResponse('ID da competição é obrigatório');
      }

      // Buscar a competição diária e sua vinculação semanal
      const { data: dailyCompetition, error: dailyError } = await supabase
        .from('custom_competitions')
        .select('weekly_tournament_id')
        .eq('id', competitionId)
        .single();

      if (dailyError || !dailyCompetition?.weekly_tournament_id) {
        console.error('❌ Competição diária não vinculada a uma competição semanal');
        return createErrorResponse('Competição diária deve estar vinculada a uma competição semanal');
      }

      // Como não há ranking diário separado, buscar participações da competição semanal vinculada
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_position, user_score, user_id, created_at')
        .eq('competition_id', dailyCompetition.weekly_tournament_id)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true })
        .limit(100);

      if (participationsError) {
        console.error('❌ Erro ao buscar participações:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        console.log('📊 Nenhuma participação encontrada para a competição semanal vinculada');
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

      // Combinar dados
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

      console.log('✅ Ranking da competição semanal vinculada carregado:', rankingData.length);
      return createSuccessResponse(rankingData);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      return createErrorResponse(handleServiceError(error, 'GET_WEEKLY_COMPETITION_RANKING'));
    }
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();
