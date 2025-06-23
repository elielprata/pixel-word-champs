
import { useState, useCallback, useEffect } from 'react';
import { GameConfig, WordFound } from '@/types';
import { gameService } from '@/services/gameService';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

export const useChallengeGameLogic = (config: GameConfig) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [wordsFound, setWordsFound] = useState<WordFound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const startGame = useCallback(async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Iniciando novo jogo', { config }, 'CHALLENGE_GAME_LOGIC');
      
      const response = await gameService.createGameSession(config, user.id);
      
      if (response.success && response.data) {
        setSessionId(response.data.id);
        setGameStarted(true);
        setGameCompleted(false);
        setCurrentScore(0);
        setWordsFound([]);
        logger.info('Jogo iniciado com sucesso', { sessionId: response.data.id }, 'CHALLENGE_GAME_LOGIC');
      } else {
        setError(response.error || 'Erro ao iniciar jogo');
        logger.error('Erro ao iniciar jogo', { error: response.error }, 'CHALLENGE_GAME_LOGIC');
      }
    } catch (err) {
      const errorMessage = 'Erro inesperado ao iniciar jogo';
      setError(errorMessage);
      logger.error('Erro inesperado ao iniciar jogo', { error: err }, 'CHALLENGE_GAME_LOGIC');
    } finally {
      setIsLoading(false);
    }
  }, [config, user]);

  const completeGame = useCallback(async (finalScore: number, finalWordsFound: WordFound[]) => {
    if (!sessionId) {
      logger.error('Tentativa de completar jogo sem sessionId', undefined, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    setIsLoading(true);

    try {
      logger.info('Finalizando jogo', { sessionId, finalScore, wordsCount: finalWordsFound.length }, 'CHALLENGE_GAME_LOGIC');
      
      const response = await gameService.completeGameSession(sessionId, finalScore, finalWordsFound);
      
      if (response.success) {
        setGameCompleted(true);
        setCurrentScore(finalScore);
        setWordsFound(finalWordsFound);
        logger.info('Jogo finalizado com sucesso', { finalScore }, 'CHALLENGE_GAME_LOGIC');
      } else {
        setError(response.error || 'Erro ao finalizar jogo');
        logger.error('Erro ao finalizar jogo', { error: response.error }, 'CHALLENGE_GAME_LOGIC');
      }
    } catch (err) {
      const errorMessage = 'Erro inesperado ao finalizar jogo';
      setError(errorMessage);
      logger.error('Erro inesperado ao finalizar jogo', { error: err }, 'CHALLENGE_GAME_LOGIC');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const resetGame = useCallback(() => {
    logger.debug('Resetando jogo', undefined, 'CHALLENGE_GAME_LOGIC');
    setSessionId(null);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentScore(0);
    setWordsFound([]);
    setError(null);
  }, []);

  return {
    sessionId,
    gameStarted,
    gameCompleted,
    currentScore,
    wordsFound,
    isLoading,
    error,
    startGame,
    completeGame,
    resetGame
  };
};
