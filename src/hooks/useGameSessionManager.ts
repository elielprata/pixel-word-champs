
import { useState, useCallback, useRef } from 'react';
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
  const sessionRef = useRef<GameSession | null>(null);
  const { user } = useAuth();

  // ✅ SESSÃO ESTÁVEL: Manter referência sincronizada
  const updateSession = useCallback((session: GameSession | null) => {
    setCurrentSession(session);
    sessionRef.current = session;
    setIsSessionActive(!!session);
  }, []);

  // ✅ INICIAR nova sessão com proteção
  const startNewSession = useCallback(async (level: number, boardData?: any): Promise<GameSession | null> => {
    if (!user?.id) {
      logger.error('❌ Não é possível iniciar sessão sem usuário autenticado', {}, 'SESSION_MANAGER');
      return null;
    }

    // Verificar se já existe sessão ativa
    if (sessionRef.current) {
      logger.warn('⚠️ Sessão já existe, retornando sessão atual', {
        existingSessionId: sessionRef.current.sessionId,
        level
      }, 'SESSION_MANAGER');
      return sessionRef.current;
    }

    try {
      logger.info('🔄 Iniciando nova sessão ESTÁVEL no banco', {
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

      updateSession(session);

      logger.info('✅ Sessão ESTÁVEL criada com sucesso no banco', {
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
  }, [user?.id, updateSession]);

  // ✅ ADICIONAR palavra com verificação de sessão
  const addWordFound = useCallback(async (word: string, points: number, positions: Position[]): Promise<boolean> => {
    const activeSession = sessionRef.current || currentSession;
    
    if (!activeSession || !user?.id) {
      logger.error('❌ Não é possível adicionar palavra sem sessão ativa', {
        hasSession: !!activeSession,
        hasCurrentSession: !!currentSession,
        hasRefSession: !!sessionRef.current,
        hasUser: !!user?.id,
        word,
        points
      }, 'SESSION_MANAGER');
      return false;
    }

    try {
      logger.info('🔄 Adicionando palavra à sessão ESTÁVEL', {
        sessionId: activeSession.sessionId,
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
          session_id: activeSession.sessionId,
          word,
          points,
          positions: positionsJson as any,
          found_at: new Date().toISOString()
        });

      if (wordError) throw wordError;

      logger.info('✅ Palavra salva com sucesso na sessão ESTÁVEL', {
        sessionId: activeSession.sessionId,
        word,
        points
      }, 'SESSION_MANAGER');

      return true;

    } catch (error) {
      logger.error('❌ Erro ao salvar palavra na sessão', {
        error,
        sessionId: activeSession?.sessionId,
        word,
        points
      }, 'SESSION_MANAGER');
      return false;
    }
  }, [currentSession, user?.id]);

  // ✅ COMPLETAR sessão com verificação robusta
  const completeSession = useCallback(async (timeElapsed: number): Promise<boolean> => {
    const activeSession = sessionRef.current || currentSession;
    
    if (!activeSession || !user?.id) {
      logger.error('❌ Não é possível completar sessão sem sessão ativa', {
        hasSession: !!activeSession,
        hasUser: !!user?.id
      }, 'SESSION_MANAGER');
      return false;
    }

    try {
      logger.info('🔄 Completando sessão ESTÁVEL no banco', {
        sessionId: activeSession.sessionId,
        timeElapsed
      }, 'SESSION_MANAGER');

      // Calcular total de pontos das palavras encontradas
      const { data: wordsData, error: wordsError } = await supabase
        .from('words_found')
        .select('points')
        .eq('session_id', activeSession.sessionId);

      if (wordsError) throw wordsError;

      const totalScore = wordsData?.reduce((sum, word) => sum + word.points, 0) || 0;
      const wordsCount = wordsData?.length || 0;

      logger.info('📊 Dados finais da sessão ESTÁVEL', {
        sessionId: activeSession.sessionId,
        totalScore,
        wordsCount
      }, 'SESSION_MANAGER');

      if (totalScore <= 0) {
        throw new Error('Sessão não pode ser completada com pontuação zero');
      }

      if (wordsCount < 5) {
        throw new Error(`Sessão não pode ser completada com apenas ${wordsCount} palavras`);
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
        .eq('id', activeSession.sessionId);

      if (sessionError) throw sessionError;

      logger.info('✅ Sessão ESTÁVEL completada no banco', {
        sessionId: activeSession.sessionId,
        totalScore,
        wordsCount,
        timeElapsed
      }, 'SESSION_MANAGER');

      // Limpar sessão atual após completar
      updateSession(null);

      return true;

    } catch (error) {
      logger.error('❌ Erro ao completar sessão', {
        error,
        sessionId: activeSession?.sessionId
      }, 'SESSION_MANAGER');
      return false;
    }
  }, [currentSession, user?.id, updateSession]);

  // ✅ RESETAR sessão com limpeza completa
  const resetSession = useCallback(() => {
    const hadSession = sessionRef.current || currentSession;
    
    logger.info('🔄 Resetando sessão ESTÁVEL', {
      hadSession: !!hadSession,
      sessionId: hadSession?.sessionId
    }, 'SESSION_MANAGER');
    
    updateSession(null);
  }, [currentSession, updateSession]);

  return {
    currentSession,
    isSessionActive,
    startNewSession,
    addWordFound,
    completeSession,
    resetSession
  };
};
