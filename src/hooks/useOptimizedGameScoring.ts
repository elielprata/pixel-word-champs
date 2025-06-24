
import { useState, useCallback } from 'react';
import { useGameSessionManager } from './useGameSessionManager';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

export const useOptimizedGameScoring = (level: number, boardData: any) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const { startGameSession, updateSessionData, completeGameSession, discardSession } = useGameSessionManager();
  
  // ETAPA 4: Constante para total de palavras necessárias
  const TOTAL_WORDS_REQUIRED = 5;

  // Inicializar sessão no banco
  const initializeSession = useCallback(async () => {
    try {
      const session = await startGameSession(level, boardData);
      setCurrentSession(session);
      logger.info('🎮 Sessão inicializada no banco', { sessionId: session?.id });
    } catch (error) {
      logger.error('❌ Erro ao inicializar sessão', { error });
    }
  }, [level, boardData, startGameSession]);

  // Calcular dados do nível atual baseado nas palavras encontradas
  const calculateLevelData = useCallback((foundWords: FoundWord[]) => {
    const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
    const isLevelCompleted = foundWords.length >= TOTAL_WORDS_REQUIRED;

    return { currentLevelScore, isLevelCompleted };
  }, []);

  const registerLevelCompletion = useCallback(async (foundWords: FoundWord[], timeElapsed: number) => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está registrando conclusão, ignorando nova tentativa');
      return;
    }

    const { currentLevelScore, isLevelCompleted } = calculateLevelData(foundWords);

    if (!isLevelCompleted) {
      logger.warn('⚠️ Tentativa de registrar nível incompleto - descartando');
      await discardSession();
      return;
    }

    setIsUpdatingScore(true);
    
    try {
      logger.info(`🔄 Registrando conclusão do nível ${level}: +${currentLevelScore} pontos`);

      // Registrar sessão COMPLETADA no banco
      const session = await completeGameSession(currentLevelScore, foundWords, timeElapsed);

      if (session) {
        logger.info(`✅ Nível ${level} completado e registrado: ${currentLevelScore} pontos`);
      }

    } catch (error) {
      logger.error('❌ Erro ao registrar conclusão do nível:', error);
    } finally {
      setIsUpdatingScore(false);
    }
  }, [level, isUpdatingScore, calculateLevelData, completeGameSession, discardSession]);

  const discardIncompleteLevel = useCallback(async () => {
    logger.info(`🗑️ Descartando nível ${level} incompleto - pontos não salvos`);
    await discardSession();
  }, [level, discardSession]);

  return {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    initializeSession,
    isUpdatingScore
  };
};
