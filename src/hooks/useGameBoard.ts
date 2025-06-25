
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
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

  // Hook para board otimizado
  const { 
    boardData, 
    size,
    levelWords, 
    isLoading: boardLoading,
    error: boardError,
    isWordSelectionError
  } = useOptimizedBoard(level);

  // Hook para pontuação otimizada
  const {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    initializeSession,
    isUpdatingScore
  } = useOptimizedGameScoring(level, boardData);

  // Estado do jogo - AGORA COM boardData
  const gameState = useGameState(levelWords, timeLeft, onLevelComplete, boardData);

  // Interações com células
  const cellInteractions = useCellInteractions(
    gameState.foundWords,
    gameState.permanentlyMarkedCells,
    gameState.hintHighlightedCells
  );

  // Inicializar sessão quando o jogo estiver pronto
  useEffect(() => {
    if (boardData && levelWords.length > 0 && !gameInitialized.current) {
      initializeSession();
      gameInitialized.current = true;
      setIsLoading(false);
      logger.info('🎮 Jogo inicializado - sessão em memória criada', { level });
    }
  }, [boardData, levelWords, initializeSession, level]);

  // Verificar se há erro na seleção de palavras/board
  useEffect(() => {
    if (boardError) {
      setError(boardError);
      setIsLoading(false);
    }
  }, [boardError]);

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
    isLoading: isLoading || boardLoading,
    error,
    isWordSelectionError,
    boardProps: {
      boardData,
      size,
      selectedCells: cellInteractions.selectedCells,
      isDragging: cellInteractions.isDragging
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
    cellInteractionProps: {
      handleCellStart: cellInteractions.handleCellStart,
      handleCellMove: cellInteractions.handleCellMove,
      handleCellEnd: cellInteractions.handleCellEnd,
      isCellSelected: cellInteractions.isCellSelected,
      isCellPermanentlyMarked: cellInteractions.isCellPermanentlyMarked,
      isCellHintHighlighted: cellInteractions.isCellHintHighlighted,
      getCellWordIndex: cellInteractions.getCellWordIndex,
      getWordColor: cellInteractions.getWordColor
    },
    gameActions: {
      useHint: gameState.useHint,
      handleGoHome,
      closeGameOver
    }
  };
};
