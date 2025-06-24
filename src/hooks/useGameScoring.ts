
import { useState, useEffect } from 'react';
import { useOptimizedGameScoring } from './useOptimizedGameScoring';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

export const useGameScoring = (foundWords: FoundWord[], level: number, boardData?: any) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  
  // Hook otimizado para pontuação
  const {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel
  } = useOptimizedGameScoring(level, boardData);

  // Calcular dados do nível atual
  const { currentLevelScore, isLevelCompleted } = calculateLevelData(foundWords);

  const updateUserScore = async (points: number) => {
    // Esta função agora é apenas um wrapper para compatibilidade
    // A pontuação real é registrada apenas na conclusão do nível
    logger.debug(`Pontos calculados para o nível ${level}: ${points}`, { level, points });
  };

  // Função para registrar conclusão do nível (chamada externamente)
  const completeLevelScoring = async (timeElapsed: number = 0) => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está processando conclusão do nível');
      return;
    }

    if (!isLevelCompleted) {
      logger.warn('⚠️ Nível não está completo - descartando pontuação');
      discardIncompleteLevel();
      return;
    }

    setIsUpdatingScore(true);
    
    try {
      await registerLevelCompletion(foundWords, timeElapsed);
      logger.info(`✅ Nível ${level} finalizado com ${currentLevelScore} pontos`);
    } catch (error) {
      logger.error('❌ Erro ao finalizar pontuação do nível:', error);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  return {
    currentLevelScore,
    isLevelCompleted,
    TOTAL_WORDS_REQUIRED,
    updateUserScore,
    completeLevelScoring,
    isUpdatingScore
  };
};
