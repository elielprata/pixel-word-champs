
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

class CompetitionParticipationService {
  async hasUserParticipated(userId: string): Promise<{ success: boolean; hasParticipated: boolean; error?: string }> {
    try {
      logger.debug('Verificando se usuário participou', { userId }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id, is_completed')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const hasParticipated = !!data;
      
      logger.debug('Verificação de participação concluída', { userId, hasParticipated }, 'COMPETITION_PARTICIPATION_SERVICE');
      return {
        success: true,
        hasParticipated
      };
    } catch (error) {
      logger.error('Erro ao verificar participação do usuário', { userId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      return {
        success: false,
        hasParticipated: false,
        error: handleServiceError(error, 'CHECK_PARTICIPATION')
      };
    }
  }

  async hasUserParticipatedInCompetition(userId: string, competitionId: string): Promise<{ success: boolean; hasParticipated: boolean; error?: string }> {
    try {
      logger.debug('Verificando participação em competição específica', { userId, competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      const { data, error } = await supabase
        .from('game_sessions')
        .select('id, is_completed')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .eq('is_completed', true) // Só considera como participação se foi completada
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const hasParticipated = !!data;
      
      logger.debug('Verificação de participação em competição concluída', { 
        userId, 
        competitionId, 
        hasParticipated 
      }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      return {
        success: true,
        hasParticipated
      };
    } catch (error) {
      logger.error('Erro ao verificar participação em competição', { userId, competitionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      return {
        success: false,
        hasParticipated: false,
        error: handleServiceError(error, 'CHECK_COMPETITION_PARTICIPATION')
      };
    }
  }

  async markUserAsParticipated(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Marcando usuário como participante', { sessionId }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      const { error } = await supabase
        .from('game_sessions')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      logger.info('Usuário marcado como participante', { sessionId }, 'COMPETITION_PARTICIPATION_SERVICE');
      return { success: true };
    } catch (error) {
      logger.error('Erro ao marcar participação', { sessionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      return {
        success: false,
        error: handleServiceError(error, 'MARK_PARTICIPATION')
      };
    }
  }

  async checkUserParticipation(userId: string, competitionId: string): Promise<boolean> {
    try {
      logger.debug('Verificando participação do usuário', { userId, competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      const { data, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const hasParticipated = !!data;
      logger.debug('Resultado da verificação de participação', { userId, competitionId, hasParticipated }, 'COMPETITION_PARTICIPATION_SERVICE');
      return hasParticipated;
    } catch (error) {
      logger.error('Erro ao verificar participação do usuário', { userId, competitionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      return false;
    }
  }

  async createParticipation(userId: string, competitionId: string, score: number = 0): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Criando participação - PARTICIPAÇÃO LIVRE', { userId, competitionId, score }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      // Participação livre - sem verificação de limites
      const { error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: userId,
          competition_id: competitionId,
          user_score: score
        });

      if (error) throw error;

      logger.info('Participação criada com sucesso', { userId, competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');
      return { success: true };
    } catch (error) {
      logger.error('Erro ao criar participação', { userId, competitionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      return {
        success: false,
        error: handleServiceError(error, 'CREATE_PARTICIPATION')
      };
    }
  }

  async updateParticipationScore(sessionId: string, totalScore: number): Promise<void> {
    try {
      logger.debug('Atualizando pontuação da participação', { sessionId, totalScore }, 'COMPETITION_PARTICIPATION_SERVICE');
      
      const { error } = await supabase
        .from('game_sessions')
        .update({ total_score: totalScore })
        .eq('id', sessionId);

      if (error) throw error;
      
      logger.debug('Pontuação da participação atualizada', { sessionId, totalScore }, 'COMPETITION_PARTICIPATION_SERVICE');
    } catch (error) {
      logger.error('Erro ao atualizar pontuação da participação', { sessionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      throw error;
    }
  }

  async updateCompetitionRankings(competitionId: string): Promise<void> {
    try {
      logger.debug('Atualizando rankings da competição - PARTICIPAÇÃO LIVRE', { competitionId }, 'COMPETITION_PARTICIPATION_SERVICE');
    } catch (error) {
      logger.error('Erro ao atualizar rankings da competição', { competitionId, error }, 'COMPETITION_PARTICIPATION_SERVICE');
      throw error;
    }
  }
}

export const competitionParticipationService = new CompetitionParticipationService();
