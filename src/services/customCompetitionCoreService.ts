import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface CustomCompetition {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  theme: string | null;
  start_date: string;
  end_date: string;
  competition_type: 'tournament' | 'challenge';
  status: 'scheduled' | 'active' | 'completed';
  max_participants: number | null;
  created_by: string;
  weekly_tournament_id: string | null;
}

interface CompetitionFilters {
  status?: 'scheduled' | 'active' | 'completed';
  competition_type?: 'tournament' | 'challenge';
  created_by?: string;
}

class CustomCompetitionCoreService {
  async getActiveCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando todas as competições ativas', undefined, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições ativas no banco de dados', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw error;
      }

      logger.debug('Competições ativas carregadas', { 
        count: competitions?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições ativas', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }

  async getDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando competições diárias', undefined, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições diárias no banco de dados', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw error;
      }

      logger.debug('Competições diárias carregadas', { 
        count: competitions?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições diárias', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_DAILY_COMPETITIONS'));
    }
  }

  async getWeeklyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando competições semanais', undefined, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições semanais no banco de dados', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw error;
      }

      logger.debug('Competições semanais carregadas', { 
        count: competitions?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições semanais', { error }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_WEEKLY_COMPETITIONS'));
    }
  }

  async joinCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Tentativa de participar da competição', { competitionId }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de participar sem usuário autenticado', { competitionId }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      // Verificar se a competição existe e está ativa
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('id, status, max_participants')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        logger.error('Competição não encontrada', { 
          competitionId, 
          error: compError 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        return createErrorResponse('Competição não encontrada');
      }

      if (competition.status !== 'active') {
        logger.warn('Tentativa de participar de competição inativa', { 
          competitionId, 
          status: competition.status 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        return createErrorResponse('Competição não está ativa');
      }

      // Verificar se já está participando
      const { data: existingParticipation, error: checkError } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação existente', { 
          competitionId, 
          userId: user.id, 
          error: checkError 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw checkError;
      }

      if (existingParticipation) {
        logger.info('Usuário já está participando da competição', { 
          competitionId, 
          userId: user.id 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        return createSuccessResponse(true);
      }

      // Verificar limite de participantes
      if (competition.max_participants) {
        const { count, error: countError } = await supabase
          .from('competition_participations')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', competitionId);

        if (countError) {
          logger.error('Erro ao verificar número de participantes', { 
            competitionId, 
            error: countError 
          }, 'CUSTOM_COMPETITION_CORE_SERVICE');
          throw countError;
        }

        if ((count || 0) >= competition.max_participants) {
          logger.warn('Competição atingiu limite de participantes', { 
            competitionId, 
            currentCount: count,
            maxParticipants: competition.max_participants 
          }, 'CUSTOM_COMPETITION_CORE_SERVICE');
          return createErrorResponse('Competição atingiu o limite de participantes');
        }
      }

      // Criar nova participação
      const { error: insertError } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        logger.error('Erro ao criar participação na competição', { 
          competitionId, 
          userId: user.id, 
          error: insertError 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw insertError;
      }

      logger.info('Participação na competição criada com sucesso', { 
        competitionId, 
        userId: user.id 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao participar da competição', { 
        competitionId, 
        error 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'JOIN_COMPETITION'));
    }
  }

  async getCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando ranking da competição', { competitionId }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      const { data: rankings, error } = await supabase
        .from('competition_participations')
        .select(`
          user_score,
          user_position,
          joined_at,
          updated_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('Erro ao buscar ranking da competição no banco de dados', { 
          competitionId, 
          error 
        }, 'CUSTOM_COMPETITION_CORE_SERVICE');
        throw error;
      }

      logger.debug('Ranking da competição carregado', { 
        competitionId, 
        entriesCount: rankings?.length || 0 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');

      return createSuccessResponse(rankings || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar ranking da competição', { 
        competitionId, 
        error 
      }, 'CUSTOM_COMPETITION_CORE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITION_RANKING'));
    }
  }
}

export const customCompetitionCoreService = new CustomCompetitionCoreService();
