
import { supabase } from '@/integrations/supabase/client';
import { CompetitionParticipation, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export class CompetitionJoinService {
  async joinCompetition(competitionId: string): Promise<ApiResponse<CompetitionParticipation>> {
    try {
      logger.info('Tentativa de participar em competição', { competitionId }, 'COMPETITION_JOIN_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('Usuário não autenticado ao tentar participar', { competitionId }, 'COMPETITION_JOIN_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          user_score: 0
        })
        .select()
        .single();

      if (error) throw error;

      const participation: CompetitionParticipation = {
        id: data.id,
        competition_id: data.competition_id || '',
        user_id: data.user_id || '',
        user_position: data.user_position || 0,
        user_score: data.user_score || 0,
        prize: data.prize ? Number(data.prize) : undefined,
        payment_status: data.payment_status || 'pending',
        payment_date: data.payment_date || undefined
      };

      logger.info('Participação criada com sucesso', { competitionId, userId: user.id }, 'COMPETITION_JOIN_SERVICE');
      return createSuccessResponse(participation);
    } catch (error) {
      logger.error('Erro ao participar de competição', { competitionId, error }, 'COMPETITION_JOIN_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPETITION_JOIN'));
    }
  }

  async getCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando ranking da competição', { competitionId }, 'COMPETITION_JOIN_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .select(`
          user_position,
          user_score,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .not('user_position', 'is', null)
        .order('user_position', { ascending: true });

      if (error) throw error;

      logger.debug('Ranking da competição carregado', { competitionId, count: data?.length || 0 }, 'COMPETITION_JOIN_SERVICE');
      return createSuccessResponse(data || []);
    } catch (error) {
      logger.error('Erro ao buscar ranking da competição', { competitionId, error }, 'COMPETITION_JOIN_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPETITION_RANKING'));
    }
  }
}

export const competitionJoinService = new CompetitionJoinService();
