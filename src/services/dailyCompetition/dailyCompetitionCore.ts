
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class DailyCompetitionCoreService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.info('Buscando TODAS as competições diárias ativas...', undefined, 'DAILY_COMPETITION_CORE');

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
        logger.error('Erro na consulta SQL', { error }, 'DAILY_COMPETITION_CORE');
        throw error;
      }

      if (!data) {
        logger.warn('Nenhum dado retornado do banco', undefined, 'DAILY_COMPETITION_CORE');
        return createSuccessResponse([]);
      }

      logger.info('Total de competições diárias ativas encontradas', { 
        count: data.length 
      }, 'DAILY_COMPETITION_CORE');
      
      // Log detalhado de cada competição encontrada
      data.forEach((comp, index) => {
        logger.debug('Competição encontrada', {
          index: index + 1,
          id: comp.id,
          title: comp.title,
          status: comp.status,
          start_date: comp.start_date,
          end_date: comp.end_date,
          hasWeeklyLink: !!comp.weekly_tournament_id,
          weeklyStatus: comp.weekly_competition?.status || 'N/A'
        }, 'DAILY_COMPETITION_CORE');
      });

      // Retornar todas as competições ativas (não filtrar por vinculação semanal)
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao buscar competições diárias ativas', { error }, 'DAILY_COMPETITION_CORE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_DAILY_COMPETITIONS'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      logger.info('Buscando ranking da competição diária (transferido para semanal)', { 
        competitionId 
      }, 'DAILY_COMPETITION_CORE');
      
      if (!competitionId) {
        logger.error('ID da competição não fornecido', undefined, 'DAILY_COMPETITION_CORE');
        return createErrorResponse('ID da competição é obrigatório');
      }

      // Buscar a competição diária e sua vinculação semanal
      const { data: dailyCompetition, error: dailyError } = await supabase
        .from('custom_competitions')
        .select('weekly_tournament_id')
        .eq('id', competitionId)
        .single();

      if (dailyError || !dailyCompetition?.weekly_tournament_id) {
        logger.error('Competição diária não vinculada a uma competição semanal', { 
          competitionId 
        }, 'DAILY_COMPETITION_CORE');
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
        logger.error('Erro ao buscar participações', { 
          weeklyTournamentId: dailyCompetition.weekly_tournament_id,
          error: participationsError 
        }, 'DAILY_COMPETITION_CORE');
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        logger.info('Nenhuma participação encontrada para a competição semanal vinculada', { 
          weeklyTournamentId: dailyCompetition.weekly_tournament_id 
        }, 'DAILY_COMPETITION_CORE');
        return createSuccessResponse([]);
      }

      // Buscar perfis dos usuários
      const userIds = participations.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Erro ao buscar perfis', { error: profilesError }, 'DAILY_COMPETITION_CORE');
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

      logger.info('Ranking da competição semanal vinculada carregado', { 
        entriesCount: rankingData.length 
      }, 'DAILY_COMPETITION_CORE');
      return createSuccessResponse(rankingData);
    } catch (error) {
      logger.error('Erro ao carregar ranking', { 
        competitionId, 
        error 
      }, 'DAILY_COMPETITION_CORE');
      return createErrorResponse(handleServiceError(error, 'GET_WEEKLY_COMPETITION_RANKING'));
    }
  }
}

export const dailyCompetitionCoreService = new DailyCompetitionCoreService();
