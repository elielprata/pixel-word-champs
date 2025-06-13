
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

interface GameSessionData {
  level: number;
  boardSize: number;
  competitionId?: string;
}

interface GameSession {
  id: string;
  level: number;
  total_score: number;
  created_at: string;
  competition_id?: string;
}

class GameService {
  async createGameSession(data: GameSessionData): Promise<ApiResponse<GameSession>> {
    try {
      logger.info('Criando nova sessão de jogo', { 
        level: data.level, 
        boardSize: data.boardSize,
        hasCompetitionId: !!data.competitionId 
      }, 'GAME_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de criar sessão sem usuário autenticado', undefined, 'GAME_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const sessionData = {
        user_id: user.id,
        level: data.level,
        board_size: data.boardSize,
        total_score: 0,
        status: 'active',
        competition_id: data.competitionId || null
      };

      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar sessão no banco de dados', { error }, 'GAME_SERVICE');
        throw error;
      }

      logger.info('Sessão de jogo criada com sucesso', { 
        sessionId: session.id,
        userId: user.id 
      }, 'GAME_SERVICE');

      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro crítico ao criar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'CREATE_GAME_SESSION'));
    }
  }

  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<ApiResponse<GameSession>> {
    try {
      logger.debug('Atualizando sessão de jogo', { 
        sessionId, 
        updates 
      }, 'GAME_SERVICE');

      const { data: session, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar sessão no banco de dados', { 
          sessionId, 
          error 
        }, 'GAME_SERVICE');
        throw error;
      }

      logger.info('Sessão atualizada com sucesso', { sessionId }, 'GAME_SERVICE');
      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro crítico ao atualizar sessão', { 
        sessionId, 
        error 
      }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'UPDATE_GAME_SESSION'));
    }
  }

  async completeGameSession(sessionId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Finalizando sessão de jogo', { sessionId }, 'GAME_SERVICE');

      const { error } = await supabase
        .from('game_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        logger.error('Erro ao finalizar sessão no banco de dados', { 
          sessionId, 
          error 
        }, 'GAME_SERVICE');
        throw error;
      }

      logger.info('Sessão finalizada com sucesso', { sessionId }, 'GAME_SERVICE');
      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Erro crítico ao finalizar sessão', { 
        sessionId, 
        error 
      }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'COMPLETE_GAME_SESSION'));
    }
  }

  async getActiveSession(): Promise<ApiResponse<GameSession | null>> {
    try {
      logger.debug('Buscando sessão ativa', undefined, 'GAME_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar sessão sem usuário autenticado', undefined, 'GAME_SERVICE');
        return createErrorResponse('Usuário não autenticado');
      }

      const { data: session, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Erro ao buscar sessão ativa no banco de dados', { error }, 'GAME_SERVICE');
        throw error;
      }

      if (session) {
        logger.debug('Sessão ativa encontrada', { sessionId: session.id }, 'GAME_SERVICE');
      } else {
        logger.debug('Nenhuma sessão ativa encontrada', undefined, 'GAME_SERVICE');
      }

      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro crítico ao buscar sessão ativa', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GET_ACTIVE_SESSION'));
    }
  }
}

export const gameService = new GameService();
