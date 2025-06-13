
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface Competition {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'completed';
  competition_type: 'tournament' | 'challenge';
  max_participants?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

class CompetitionService {
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    try {
      logger.info('Buscando competições ativas', undefined, 'COMPETITION_SERVICE');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar competições ativas no banco de dados', { error }, 'COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competições ativas carregadas', { 
        count: competitions?.length || 0 
      }, 'COMPETITION_SERVICE');

      return createSuccessResponse(competitions || []);
    } catch (error) {
      logger.error('Erro crítico ao buscar competições ativas', { error }, 'COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_COMPETITIONS'));
    }
  }

  async getCompetitionById(id: string): Promise<ApiResponse<Competition | null>> {
    try {
      logger.debug('Buscando competição por ID', { competitionId: id }, 'COMPETITION_SERVICE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Competição não encontrada', { competitionId: id }, 'COMPETITION_SERVICE');
          return createSuccessResponse(null);
        }
        logger.error('Erro ao buscar competição no banco de dados', { 
          competitionId: id, 
          error 
        }, 'COMPETITION_SERVICE');
        throw error;
      }

      logger.debug('Competição encontrada', { competitionId: id }, 'COMPETITION_SERVICE');
      return createSuccessResponse(competition);
    } catch (error) {
      logger.error('Erro crítico ao buscar competição', { 
        competitionId: id, 
        error 
      }, 'COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITION_BY_ID'));
    }
  }

  async joinCompetition(competitionId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Tentativa de participar da competição', { competitionId }, 'COMPETITION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de participar sem usuário autenticado', { competitionId }, 'COMPETITION_SERVICE');
        return createErrorResponse('Usuário não autenticado');
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
        }, 'COMPETITION_SERVICE');
        throw checkError;
      }

      if (existingParticipation) {
        logger.info('Usuário já está participando da competição', { 
          competitionId, 
          userId: user.id 
        }, 'COMPETITION_SERVICE');
        return createSuccessResponse(true);
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
        }, 'COMPETITION_SERVICE');
        throw insertError;
      }

      logger.info('Participação na competição criada com sucesso', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao participar da competição', { 
        competitionId, 
        error 
      }, 'COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'JOIN_COMPETITION'));
    }
  }

  async updateParticipationScore(competitionId: string, score: number): Promise<ApiResponse<boolean>> {
    try {
      logger.debug('Atualizando pontuação da participação', { 
        competitionId, 
        score 
      }, 'COMPETITION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de atualizar pontuação sem usuário autenticado', { 
          competitionId 
        }, 'COMPETITION_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('competition_participations')
        .update({ 
          user_score: score,
          updated_at: new Date().toISOString()
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Erro ao atualizar pontuação no banco de dados', { 
          competitionId, 
          userId: user.id, 
          score, 
          error 
        }, 'COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Pontuação da participação atualizada com sucesso', { 
        competitionId, 
        userId: user.id, 
        score 
      }, 'COMPETITION_SERVICE');

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao atualizar pontuação', { 
        competitionId, 
        score, 
        error 
      }, 'COMPETITION_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_PARTICIPATION_SCORE'));
    }
  }
}

export const competitionService = new CompetitionService();
