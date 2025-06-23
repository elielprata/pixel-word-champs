
import { supabase } from '@/integrations/supabase/client';
import { CompetitionParticipation, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class CompetitionJoinService {
  async joinCompetition(competitionId: string, userId: string): Promise<ApiResponse<CompetitionParticipation>> {
    try {
      logger.info('Usuário entrando em competição', { competitionId, userId }, 'COMPETITION_JOIN_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          user_score: 0,
          user_position: null
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao entrar na competição', { error: error.message }, 'COMPETITION_JOIN_SERVICE');
        throw new Error(error.message);
      }

      const participation: CompetitionParticipation = {
        id: data.id,
        competition_id: data.competition_id,
        user_id: data.user_id,
        score: data.user_score || 0,
        user_score: data.user_score,
        user_position: data.user_position,
        joined_at: data.created_at || new Date().toISOString(),
        payment_status: data.payment_status as 'pending' | 'paid' | 'failed' | 'not_eligible',
        payment_date: data.payment_date
      };

      logger.info('Participação criada com sucesso', { participationId: data.id }, 'COMPETITION_JOIN_SERVICE');
      return createSuccessResponse(participation);
    } catch (error) {
      logger.error('Erro ao entrar na competição', { error }, 'COMPETITION_JOIN_SERVICE');
      return createErrorResponse(handleServiceError(error, 'JOIN_COMPETITION'));
    }
  }

  async checkUserParticipation(competitionId: string, userId: string): Promise<ApiResponse<CompetitionParticipation | null>> {
    try {
      logger.debug('Verificando participação do usuário', { competitionId, userId }, 'COMPETITION_JOIN_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao verificar participação', { error: error.message }, 'COMPETITION_JOIN_SERVICE');
        throw new Error(error.message);
      }

      if (!data) {
        logger.debug('Usuário não participa da competição', { competitionId, userId }, 'COMPETITION_JOIN_SERVICE');
        return createSuccessResponse(null);
      }

      const participation: CompetitionParticipation = {
        id: data.id,
        competition_id: data.competition_id,
        user_id: data.user_id,
        score: data.user_score || 0,
        user_score: data.user_score,
        user_position: data.user_position,
        joined_at: data.created_at || '',
        payment_status: data.payment_status as 'pending' | 'paid' | 'failed' | 'not_eligible',
        payment_date: data.payment_date
      };

      logger.debug('Participação encontrada', { participationId: data.id }, 'COMPETITION_JOIN_SERVICE');
      return createSuccessResponse(participation);
    } catch (error) {
      logger.error('Erro ao verificar participação', { error }, 'COMPETITION_JOIN_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CHECK_USER_PARTICIPATION'));
    }
  }
}

export const competitionJoinService = new CompetitionJoinService();
