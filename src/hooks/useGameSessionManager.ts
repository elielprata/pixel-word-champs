
import { useState, useCallback } from 'react';
import { gameService } from '@/services/gameService';
import { gameScoreService } from '@/services/gameScoreService';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

interface SessionData {
  sessionId: string;
  level: number;
  board: string[][];
  wordsFound: string[];
  totalScore: number;
  timeElapsed: number;
  isCompleted: boolean;
}

export const useGameSessionManager = () => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const startNewSession = useCallback(async (level: number, competitionId?: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await gameService.startGameSession({
        level,
        competitionId
      });

      if (response.success && response.data) {
        const session: SessionData = {
          sessionId: response.data.id,
          level: response.data.level,
          board: response.data.board,
          wordsFound: [],
          totalScore: 0,
          timeElapsed: 0,
          isCompleted: false
        };

        setCurrentSession(session);
        logger.info('Nova sessão iniciada', { sessionId: session.sessionId, level }, 'SESSION_MANAGER');
        return session;
      } else {
        throw new Error(response.error || 'Erro ao iniciar sessão');
      }
    } catch (err) {
      logger.error('Erro ao iniciar sessão', { error: err, level }, 'SESSION_MANAGER');
      setError('Erro ao iniciar nova sessão');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addWordFound = useCallback(async (word: string, points: number, positions: any[]) => {
    if (!currentSession || !user) return false;

    try {
      const response = await gameService.addWordFound(currentSession.sessionId, word, points, positions);
      
      if (response.success) {
        setCurrentSession(prev => prev ? {
          ...prev,
          wordsFound: [...prev.wordsFound, word],
          totalScore: prev.totalScore + points
        } : null);

        logger.info('Palavra adicionada', { 
          sessionId: currentSession.sessionId, 
          word, 
          points 
        }, 'SESSION_MANAGER');
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Erro ao adicionar palavra', { error: err, word }, 'SESSION_MANAGER');
      return false;
    }
  }, [currentSession, user]);

  const completeSession = useCallback(async (timeElapsed: number, competitionId?: string) => {
    if (!currentSession || !user) return null;

    setIsLoading(true);
    try {
      // Complete the game session
      const sessionResponse = await gameService.completeGameSession(
        currentSession.sessionId,
        currentSession.totalScore,
        timeElapsed
      );

      if (sessionResponse.success) {
        // Update both temporary and permanent scores using new service
        const scoreResponse = await gameScoreService.updateGameScore(
          user.id,
          currentSession.totalScore,
          competitionId
        );

        if (scoreResponse.success) {
          logger.info('Sessão completada e pontuações atualizadas', {
            sessionId: currentSession.sessionId,
            gamePoints: currentSession.totalScore,
            newTotalScore: scoreResponse.data.total_score,
            newExperiencePoints: scoreResponse.data.experience_points
          }, 'SESSION_MANAGER');

          const completedSession = {
            ...currentSession,
            timeElapsed,
            isCompleted: true
          };

          setCurrentSession(completedSession);
          return {
            session: completedSession,
            scores: scoreResponse.data
          };
        } else {
          throw new Error('Erro ao atualizar pontuações');
        }
      } else {
        throw new Error(sessionResponse.error || 'Erro ao completar sessão');
      }
    } catch (err) {
      logger.error('Erro ao completar sessão', { 
        error: err, 
        sessionId: currentSession.sessionId 
      }, 'SESSION_MANAGER');
      setError('Erro ao completar sessão');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, user]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
  }, []);

  return {
    currentSession,
    isLoading,
    error,
    startNewSession,
    addWordFound,
    completeSession,
    resetSession
  };
};
