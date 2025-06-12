
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class CompetitionQueryService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando competições diárias ativas no banco', undefined, 'COMPETITION_QUERY_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active');

      logger.debug('Resposta da consulta de competições diárias', { data, error }, 'COMPETITION_QUERY_SERVICE');

      if (error) {
        logger.error('Erro na consulta SQL de competições diárias', { error }, 'COMPETITION_QUERY_SERVICE');
        throw error;
      }

      if (!data) {
        logger.warn('Nenhum dado retornado da consulta de competições diárias', undefined, 'COMPETITION_QUERY_SERVICE');
        return createSuccessResponse([]);
      }

      logger.info('Competições diárias ativas encontradas', { count: data.length }, 'COMPETITION_QUERY_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao buscar competições diárias ativas', { error }, 'COMPETITION_QUERY_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando ranking da competição diária', { competitionId }, 'COMPETITION_QUERY_SERVICE');
      
      if (!competitionId) {
        logger.error('ID da competição não fornecido para ranking', undefined, 'COMPETITION_QUERY_SERVICE');
        return createErrorResponse('ID da competição é obrigatório');
      }

      // Buscar participações primeiro
      const { data: participations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('user_position, user_score, user_id, created_at')
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true })
        .limit(100);

      if (participationsError) {
        logger.error('Erro ao buscar participações para ranking', { competitionId, error: participationsError }, 'COMPETITION_QUERY_SERVICE');
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        logger.warn('Nenhuma participação encontrada para ranking', { competitionId }, 'COMPETITION_QUERY_SERVICE');
        return createSuccessResponse([]);
      }

      // Buscar perfis dos usuários
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis para ranking', { competitionId, error: profilesError }, 'COMPETITION_QUERY_SERVICE');
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

      logger.info('Ranking da competição diária carregado', { competitionId, count: rankingData.length }, 'COMPETITION_QUERY_SERVICE');
      return createSuccessResponse(rankingData);
    } catch (error) {
      logger.error('Erro ao carregar ranking da competição diária', { competitionId, error }, 'COMPETITION_QUERY_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITION_RANKING'));
    }
  }
}

export const competitionQueryService = new CompetitionQueryService();
