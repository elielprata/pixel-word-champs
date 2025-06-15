
import { useMemo, useCallback, useEffect } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useSimpleSelection } from '@/hooks/useSimpleSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useGameScore } from '@/hooks/useGameScore';
import { useGameState } from '@/hooks/useGameState';
import { useCellInteractions } from '@/hooks/useCellInteractions';
import { useGameBoardProps } from '@/hooks/useGameBoardProps';
import { useGameBoardInteractions } from '@/hooks/useGameBoardInteractions';
import { logger } from '@/utils/logger';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { type Position } from '@/utils/boardUtils';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  // Usar hooks especializados
  const gameState = useGameState(level, timeLeft);
  const { currentLevelScore, updateUserScore } = useGameScore(gameState.foundWords);
  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords, onWordFound);
  const cellInteractions = useCellInteractions(
    gameState.foundWords,
    gameState.permanentlyMarkedCells,
    gameState.hintHighlightedCells
  );

  const {
    startCell,
    currentCell,
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,
    getLinearPath
  } = useSimpleSelection();

  // Level Complete quando todas as palavras são encontradas
  useEffect(() => {
    if (gameState.foundWords.length === levelWords.length && 
        levelWords.length > 0 && 
        !gameState.showLevelComplete && 
        !gameState.isLevelCompleted) {
      
      logger.info(`Level ${level} completed with score ${currentLevelScore}`);
      
      gameState.setShowLevelComplete(true);
      gameState.setIsLevelCompleted(true);
      
      updateUserScore(currentLevelScore);
      onLevelComplete(currentLevelScore);
    }
  }, [gameState.foundWords.length, levelWords.length, gameState.showLevelComplete, 
      gameState.isLevelCompleted, level, onLevelComplete, currentLevelScore, updateUserScore]);

  // Finalizar seleção com validação
  const handleCellEnd = useCallback(() => {
    const finalSelection = handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      const validatedWord = validateAndAddWord(word, finalSelection);
      if (validatedWord) {
        gameState.addFoundWord(validatedWord);
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState]);

  // Memoizar seleção atual
  const selectedCells: Position[] = useMemo(() => {
    if (isDragging && startCell && currentCell) {
      return getLinearPath(startCell, currentCell);
    }
    return [];
  }, [isDragging, startCell, currentCell, getLinearPath]);

  // Props agrupadas usando hook especializado
  const { boardProps, gameStateProps, modalProps } = useGameBoardProps({
    boardData,
    size,
    selectedCells,
    isDragging,
    foundWords: gameState.foundWords,
    levelWords,
    hintsUsed: gameState.hintsUsed,
    currentLevelScore,
    showGameOver: gameState.showGameOver,
    showLevelComplete: gameState.showLevelComplete
  });

  // Interações usando hook especializado
  const { cellInteractionProps, gameActions } = useGameBoardInteractions({
    foundWords: gameState.foundWords,
    levelWords,
    boardData,
    hintsUsed: gameState.hintsUsed,
    setHintsUsed: gameState.setHintsUsed,
    setHintHighlightedCells: gameState.setHintHighlightedCells,
    canRevive,
    setShowGameOver: gameState.setShowGameOver,
    handleStart,
    handleDrag,
    handleCellEnd,
    isCellSelected,
    cellInteractions
  });

  return {
    // Board data
    isLoading,
    error,
    isMobile,

    // Grouped props
    boardProps,
    gameStateProps,
    modalProps,
    cellInteractionProps,
    gameActions
  };
};
