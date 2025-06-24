
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedWordSelection } from './useOptimizedWordSelection';
import { useGameState } from './useGameState';
import { useCellInteractions } from './useCellInteractions';
import { useOptimizedGameScoring } from './useOptimizedGameScoring';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const gameInitialized = useRef(false);

  // Hook para seleção de palavras otimizada
  const { 
    board, 
    levelWords, 
    isWordSelectionError,
    error: wordSelectionError 
  } = useOptimizedWordSelection(level);

  // Hook para pontuação otimizada
  const {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    initializeSession,
    isUpdatingScore
  } = useOptimizedGameScoring(level, board);

  // Estado do jogo
  const gameState = useGameState(levelWords);

  // Interações com células
  const cellInteractions = useCellInteractions(
    board,
    gameState.foundWords,
    gameState.addFoundWord,
    gameState.updateHintsUsed
  );

  // Inicializar sessão quando o jogo estiver pronto
  useEffect(() => {
    if (board && levelWords.length > 0 && !gameInitialized.current) {
      initializeSession();
      gameInitialized.current = true;
      setIsLoading(false);
      logger.info('🎮 Jogo inicializado - sessão em memória criada', { level });
    }
  }, [board, levelWords, initializeSession, level]);

  // Verificar se há erro na seleção de palavras
  useEffect(() => {
    if (wordSelectionError) {
      setError(wordSelectionError);
      setIsLoading(false);
    }
  }, [wordSelectionError]);

  // Verificar conclusão do nível
  useEffect(() => {
    const { isLevelCompleted, currentLevelScore } = calculateLevelData(gameState.foundWords);
    
    if (isLevelCompleted && !showLevelComplete && !isUpdatingScore) {
      logger.info('🏆 Nível completado! Registrando...', { 
        level, 
        score: currentLevelScore,
        wordsFound: gameState.foundWords.length 
      });
      
      // Registrar conclusão do nível
      registerLevelCompletion(gameState.foundWords, 0).then(() => {
        setShowLevelComplete(true);
        onLevelComplete(currentLevelScore);
      });
    }
  }, [gameState.foundWords, calculateLevelData, showLevelComplete, isUpdatingScore, registerLevelCompletion, onLevelComplete, level]);

  // Game over quando tempo acabar
  useEffect(() => {
    if (timeLeft <= 0 && !showLevelComplete && !showGameOver) {
      logger.info('⏰ Tempo esgotado - nível não completado', { level, foundWords: gameState.foundWords.length });
      discardIncompleteLevel();
      setShowGameOver(true);
    }
  }, [timeLeft, showLevelComplete, showGameOver, discardIncompleteLevel, level, gameState.foundWords.length]);

  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu - descartando progresso', { level });
    discardIncompleteLevel();
  }, [discardIncompleteLevel, level]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  const { currentLevelScore } = calculateLevelData(gameState.foundWords);

  return {
    isLoading,
    error,
    isWordSelectionError,
    boardProps: {
      board,
      selectedCells: cellInteractions.selectedCells,
      foundWordPositions: cellInteractions.foundWordPositions,
      onCellMouseDown: cellInteractions.handleCellMouseDown,
      onCellMouseEnter: cellInteractions.handleCellMouseEnter,
      onCellMouseUp: cellInteractions.handleCellMouseUp
    },
    gameStateProps: {
      foundWords: gameState.foundWords,
      levelWords,
      hintsUsed: gameState.hintsUsed,
      currentLevelScore
    },
    modalProps: {
      showGameOver,
      showLevelComplete
    },
    cellInteractionProps: cellInteractions,
    gameActions: {
      useHint: gameState.useHint,
      handleGoHome,
      closeGameOver
    }
  };
};
