
import { supabase } from '@/integrations/supabase/client';
import { GameSession, WordFound, GameConfig, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { competitionJoinService } from './competitionJoinService';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';

class GameService {
  async createGameSession(config: GameConfig, userId: string): Promise<ApiResponse<GameSession>> {
    try {
      logger.info('Criando nova sessão de jogo', { level: config.level, userId }, 'GAME_SERVICE');

      // Se há competitionId, verificar se usuário já participa
      if (config.competitionId) {
        const participationResult = await competitionJoinService.checkUserParticipation(config.competitionId, userId);
        
        if (!participationResult.success) {
          logger.error('Erro ao verificar participação em competição', { error: participationResult.error }, 'GAME_SERVICE');
          throw new Error(participationResult.error);
        }

        // Se não participa, entrar automaticamente
        if (!participationResult.data) {
          logger.info('Entrando automaticamente na competição', { competitionId: config.competitionId }, 'GAME_SERVICE');
          
          const joinResult = await competitionJoinService.joinCompetition(config.competitionId, userId);
          if (!joinResult.success) {
            logger.error('Erro ao entrar na competição automaticamente', { error: joinResult.error }, 'GAME_SERVICE');
            throw new Error(joinResult.error);
          }
        }
      }

      const sessionData = {
        user_id: userId,
        competition_id: config.competitionId || null,
        level: config.level,
        board: [['']],
        words_found: [],
        total_score: 0,
        time_elapsed: 0,
        is_completed: false
      };

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar sessão de jogo', { error: error.message }, 'GAME_SERVICE');
        throw new Error(error.message);
      }

      const gameSession: GameSession = {
        id: data.id,
        user_id: data.user_id,
        competition_id: data.competition_id,
        level: data.level,
        board: Array.isArray(data.board) ? data.board as string[][] : [['']],
        words_found: Array.isArray(data.words_found) ? data.words_found as string[] : [],
        total_score: data.total_score || 0,
        time_elapsed: data.time_elapsed || 0,
        is_completed: data.is_completed || false,
        started_at: data.started_at,
        completed_at: data.completed_at
      };

      logger.info('Sessão de jogo criada com sucesso', { sessionId: data.id }, 'GAME_SERVICE');
      return createSuccessResponse(gameSession);
    } catch (error) {
      logger.error('Erro ao criar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_GAME_SESSION'));
    }
  }

  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<ApiResponse<GameSession>> {
    try {
      logger.debug('Atualizando sessão de jogo', { sessionId, hasUpdates: Object.keys(updates).length > 0 }, 'GAME_SERVICE');

      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar sessão de jogo', { error: error.message }, 'GAME_SERVICE');
        throw new Error(error.message);
      }

      const gameSession: GameSession = {
        id: data.id,
        user_id: data.user_id,
        competition_id: data.competition_id,
        level: data.level,
        board: Array.isArray(data.board) ? data.board as string[][] : [['']],
        words_found: Array.isArray(data.words_found) ? data.words_found as string[] : [],
        total_score: data.total_score || 0,
        time_elapsed: data.time_elapsed || 0,
        is_completed: data.is_completed || false,
        started_at: data.started_at,
        completed_at: data.completed_at
      };

      logger.debug('Sessão atualizada com sucesso', { sessionId }, 'GAME_SERVICE');
      return createSuccessResponse(gameSession);
    } catch (error) {
      logger.error('Erro ao atualizar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_GAME_SESSION'));
    }
  }

  async completeGameSession(sessionId: string, finalScore: number, wordsFound: WordFound[]): Promise<ApiResponse<GameSession>> {
    try {
      logger.info('Finalizando sessão de jogo', { sessionId, finalScore, wordsCount: wordsFound.length }, 'GAME_SERVICE');

      // Buscar a sessão para verificar se tem competição
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        logger.error('Erro ao buscar sessão para finalizar', { error: sessionError.message }, 'GAME_SERVICE');
        throw new Error(sessionError.message);
      }

      // Converter WordFound[] para string[] para compatibilidade com o banco
      const wordsAsStrings = wordsFound.map(wf => wf.word);

      // Atualizar a sessão como completa
      const updates = {
        is_completed: true,
        completed_at: new Date().toISOString(),
        total_score: finalScore,
        words_found: wordsAsStrings
      };

      const updateResult = await this.updateGameSession(sessionId, updates);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Se há competição, atualizar score da participação
      if (sessionData.competition_id) {
        logger.info('Atualizando score na competição', { competitionId: sessionData.competition_id }, 'GAME_SERVICE');
        
        const { error: updateError } = await supabase
          .from('competition_participations')
          .update({ 
            user_score: finalScore,
            completed_at: new Date().toISOString()
          })
          .eq('competition_id', sessionData.competition_id)
          .eq('user_id', sessionData.user_id);

        if (updateError) {
          logger.error('Erro ao atualizar participação na competição', { error: updateError.message }, 'GAME_SERVICE');
        }
      }

      // Atualizar estatísticas do usuário
      await this.updateUserStats(sessionData.user_id, finalScore);

      logger.info('Sessão de jogo finalizada com sucesso', { sessionId, finalScore }, 'GAME_SERVICE');
      return updateResult;
    } catch (error) {
      logger.error('Erro ao finalizar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPLETE_GAME_SESSION'));
    }
  }

  private async updateUserStats(userId: string, sessionScore: number): Promise<void> {
    try {
      logger.debug('Atualizando estatísticas do usuário', { userId, sessionScore }, 'GAME_SERVICE');

      // Primeiro, buscar o usuário atual
      const { data: currentUser, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', userId)
        .single();

      if (fetchError) {
        logger.error('Erro ao buscar usuário atual', { error: fetchError.message }, 'GAME_SERVICE');
        throw new Error(fetchError.message);
      }

      // Atualizar com os novos valores
      const { error } = await supabase
        .from('profiles')
        .update({
          total_score: (currentUser.total_score || 0) + sessionScore,
          games_played: (currentUser.games_played || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Erro ao atualizar estatísticas do usuário', { error: error.message }, 'GAME_SERVICE');
        throw new Error(error.message);
      }

      logger.debug('Estatísticas do usuário atualizadas', { userId }, 'GAME_SERVICE');
    } catch (error) {
      logger.error('Erro ao atualizar estatísticas do usuário', { error }, 'GAME_SERVICE');
      throw error;
    }
  }

  async getGameSession(sessionId: string): Promise<ApiResponse<GameSession | null>> {
    try {
      logger.debug('Buscando sessão de jogo', { sessionId }, 'GAME_SERVICE');

      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar sessão de jogo', { error: error.message }, 'GAME_SERVICE');
        throw new Error(error.message);
      }

      if (!data) {
        logger.debug('Sessão de jogo não encontrada', { sessionId }, 'GAME_SERVICE');
        return createSuccessResponse(null);
      }

      const gameSession: GameSession = {
        id: data.id,
        user_id: data.user_id,
        competition_id: data.competition_id,
        level: data.level,
        board: Array.isArray(data.board) ? data.board as string[][] : [['']],
        words_found: Array.isArray(data.words_found) ? data.words_found as string[] : [],
        total_score: data.total_score || 0,
        time_elapsed: data.time_elapsed || 0,
        is_completed: data.is_completed || false,
        started_at: data.started_at,
        completed_at: data.completed_at
      };

      logger.debug('Sessão de jogo encontrada', { sessionId }, 'GAME_SERVICE');
      return createSuccessResponse(gameSession);
    } catch (error) {
      logger.error('Erro ao buscar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_GAME_SESSION'));
    }
  }
}

export const gameService = new GameService();
