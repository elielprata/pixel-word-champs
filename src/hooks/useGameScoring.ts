
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

    // VALIDAÇÃO CRÍTICA: Só permitir conclusão se 5 palavras foram encontradas
    if (!isLevelCompleted || foundWords.length < TOTAL_WORDS_REQUIRED) {
      logger.warn(`⚠️ Nível não pode ser completado - apenas ${foundWords.length} de ${TOTAL_WORDS_REQUIRED} palavras encontradas`);
      discardIncompleteLevel();
      return;
    }

    // VALIDAÇÃO ADICIONAL: Pontuação deve ser maior que zero
    if (currentLevelScore <= 0) {
      logger.warn('⚠️ Nível não pode ser completado com pontuação zero');
      discardIncompleteLevel();
      return;
    }

    setIsUpdatingScore(true);
    
    try {
      logger.info(`🔄 Registrando conclusão válida do nível ${level}: ${foundWords.length} palavras, ${currentLevelScore} pontos`);
      await registerLevelCompletion(foundWords, timeElapsed);
      logger.info(`✅ Nível ${level} finalizado com sucesso: ${currentLevelScore} pontos`);
    } catch (error) {
      logger.error('❌ Erro ao finalizar pontuação do nível:', error);
      // Em caso de erro, descartar a sessão para evitar estados inconsistentes
      discardIncompleteLevel();
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
