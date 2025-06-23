
import { useMemo, useCallback } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useSimpleSelection } from '@/hooks/useSimpleSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameState } from '@/hooks/useGameState';
import { useCellInteractions } from '@/hooks/useCellInteractions';
import { useSelectionLock } from '@/hooks/useSelectionLock';
import { useCellInteractionLogic } from '@/hooks/game/useCellInteractionLogic';
import { useGameActions } from '@/hooks/game/useGameActions';
import { logger } from '@/utils/logger';
import { GAME_CONSTANTS } from '@/constants/game';
import { type Position } from '@/utils/boardUtils';

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
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  const gameState = useGameState();
  const { isProcessing } = useSelectionLock();

  const cellInteractions = useCellInteractions(
    gameState.gameState.foundWords,
    gameState.gameState.permanentlyMarkedCells,
    gameState.gameState.hintHighlightedCells
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

  const { handleCellEnd } = useCellInteractionLogic({
    boardData,
    gameState,
    levelWords,
    handleEnd,
    isProcessing
  });

  const gameActions = useGameActions({
    gameState,
    levelWords,
    boardData
  });

  const selectedCells: Position[] = useMemo(() => {
    if (isDragging && startCell && currentCell) {
      return getLinearPath(startCell, currentCell);
    }
    return [];
  }, [isDragging, startCell, currentCell, getLinearPath]);

  const getWordColor = useCallback((wordIndex: number) => {
    return GAME_CONSTANTS.WORD_COLORS[wordIndex % GAME_CONSTANTS.WORD_COLORS.length];
  }, []);

  const getCellWordIndex = useCallback((row: number, col: number) => {
    return gameState.gameState.foundWords.findIndex(fw => 
      fw.positions && fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  }, [gameState.gameState.foundWords]);

  return {
    isLoading,
    error,
    isMobile,
    boardProps: {
      boardData,
      size,
      selectedCells,
      isDragging: isDragging && !isProcessing
    },
    gameStateProps: {
      foundWords: gameState.gameState.foundWords,
      levelWords,
      hintsUsed: gameState.gameState.hintsUsed,
      currentLevelScore: gameState.gameState.score
    },
    modalProps: {
      showGameOver: gameState.gameState.gameStatus === 'failed',
      showLevelComplete: gameState.gameState.gameStatus === 'completed'
    },
    cellInteractionProps: {
      handleCellStart: isProcessing ? () => {} : handleStart,
      handleCellMove: isProcessing ? () => {} : handleDrag,
      handleCellEnd: isProcessing ? () => {} : handleCellEnd,
      isCellSelected,
      isCellPermanentlyMarked: cellInteractions.isCellPermanentlyMarked,
      isCellHintHighlighted: cellInteractions.isCellHintHighlighted,
      getWordColor,
      getCellWordIndex
    },
    gameActions
  };
};
