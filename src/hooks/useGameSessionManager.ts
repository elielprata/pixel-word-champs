import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

interface GameSession {
  sessionId: string;
  userId: string;
  level: number;
  startedAt: string;
  boardData: any;
}

interface Position {
  row: number;
  col: number;
}

export const useGameSessionManager = () => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { user } = useAuth();

  // ✅ INICIAR nova sessão no banco
  const startNewSession = useCallback(async (level: number, boardData?: any): Promise<GameSession | null> => {
    if (!user?.id) {
      logger.error('❌ Não é possível iniciar sessão sem usuário autenticado', {}, 'SESSION_MANAGER');
      return null;
    }

    try {
      logger.info('🔄 Iniciando nova sessão de jogo no banco', {
        userId: user.id,
        level,
        hasBoardData: !!boardData
      }, 'SESSION_MANAGER');

      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          level,
          board: boardData || {},
          words_found: [],
          total_score: 0,
          time_elapsed: 0,
          is_completed: false,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const session: GameSession = {
        sessionId: data.id,
        userId: user.id,
        level,
        startedAt: data.started_at,
        boardData: data.board
      };

      setCurrentSession(session);
      setIsSessionActive(true);

      logger.info('✅ Sessão criada com sucesso no banco', {
        sessionId: data.id,
        userId: user.id,
        level
      }, 'SESSION_MANAGER');

      return session;

    } catch (error) {
      logger.error('❌ Erro ao iniciar sessão no banco', {
        error,
        userId: user.id,
        level
      }, 'SESSION_MANAGER');
      return null;
    }
  }, [user?.id]);

  // ✅ ADICIONAR palavra encontrada na sessão
  const addWordFound = useCallback(async (word: string, points: number, positions: Position[]): Promise<boolean> => {
    if (!currentSession || !user?.id) {
      logger.error('❌ Não é possível adicionar palavra sem sessão ativa', {
        hasSession: !!currentSession,
        hasUser: !!user?.id,
        word,
        points
      }, 'SESSION_MANAGER');
      return false;
    }

    try {
      logger.info('🔄 Adicionando palavra encontrada na sessão', {
        sessionId: currentSession.sessionId,
        word,
        points,
        positionsCount: positions.length
      }, 'SESSION_MANAGER');

      // Converter positions para JSON compatível com Supabase
      const positionsJson = positions.map(pos => ({
        row: pos.row,
        col: pos.col
      }));

      // Salvar na tabela words_found
      const { error: wordError } = await supabase
        .from('words_found')
        .insert({
          session_id: currentSession.sessionId,
          word,
          points,
          positions: positionsJson as any, // Cast necessário para Json type
          found_at: new Date().toISOString()
        });

      if (wordError) throw wordError;

      logger.info('✅ Palavra salva com sucesso na sessão', {
        sessionId: currentSession.sessionId,
        word,
        points
      }, 'SESSION_MANAGER');

      return true;

    } catch (error) {
      logger.error('❌ Erro ao salvar palavra na sessão', {
        error,
        sessionId: currentSession?.sessionId,
        word,
        points
      }, 'SESSION_MANAGER');
      return false;
    }
  }, [currentSession, user?.id]);

  // ✅ COMPLETAR sessão e atualizar pontuação total
  const completeSession = useCallback(async (timeElapsed: number): Promise<boolean> => {
    if (!currentSession || !user?.id) {
      logger.error('❌ Não é possível completar sessão sem sessão ativa', {
        hasSession: !!currentSession,
        hasUser: !!user?.id
      }, 'SESSION_MANAGER');
      return false;
    }

    try {
      logger.info('🔄 Completando sessão no banco', {
        sessionId: currentSession.sessionId,
        timeElapsed
      }, 'SESSION_MANAGER');

      // Primeiro, calcular o total de pontos das palavras encontradas
      const { data: wordsData, error: wordsError } = await supabase
        .from('words_found')
        .select('points')
        .eq('session_id', currentSession.sessionId);

      if (wordsError) throw wordsError;

      const totalScore = wordsData?.reduce((sum, word) => sum + word.points, 0) || 0;

      if (totalScore <= 0) {
        throw new Error('Sessão não pode ser completada com pontuação zero');
      }

      if (wordsData?.length < 5) {
        throw new Error(`Sessão não pode ser completada com apenas ${wordsData?.length} palavras`);
      }

      // Marcar sessão como completada
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          time_elapsed: timeElapsed,
          total_score: totalScore
        })
        .eq('id', currentSession.sessionId);

      if (sessionError) throw sessionError;

      logger.info('✅ Sessão marcada como completada no banco', {
        sessionId: currentSession.sessionId,
        totalScore,
        wordsCount: wordsData?.length,
        timeElapsed
      }, 'SESSION_MANAGER');

      // Limpar sessão atual
      setCurrentSession(null);
      setIsSessionActive(false);

      return true;

    } catch (error) {
      logger.error('❌ Erro ao completar sessão', {
        error,
        sessionId: currentSession?.sessionId
      }, 'SESSION_MANAGER');
      return false;
    }
  }, [currentSession, user?.id]);

  // ✅ RESETAR sessão (limpar estado local)
  const resetSession = useCallback(() => {
    logger.info('🔄 Resetando sessão local', {
      hadSession: !!currentSession
    }, 'SESSION_MANAGER');
    
    setCurrentSession(null);
    setIsSessionActive(false);
  }, [currentSession]);

  return {
    currentSession,
    isSessionActive,
    startNewSession,
    addWordFound,
    completeSession,
    resetSession
  };
};
