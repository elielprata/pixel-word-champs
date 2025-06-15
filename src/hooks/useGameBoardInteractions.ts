
import { useCallback, useMemo } from 'react';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface BoardData {
  board: string[][];
  placedWords: any[];
}

interface UseGameBoardInteractionsParams {
  foundWords: FoundWord[];
  levelWords: string[];
  boardData: BoardData;
  hintsUsed: number;
  setHintsUsed: (value: number | ((prev: number) => number)) => void;
  setHintHighlightedCells: (positions: Position[]) => void;
  canRevive: boolean;
  setShowGameOver: (value: boolean) => void;
  handleStart: (row: number, col: number) => void;
  handleDrag: (row: number, col: number) => void;
  handleCellEnd: () => void;
  isCellSelected: (row: number, col: number) => boolean;
  cellInteractions: any;
}

export const useGameBoardInteractions = ({
  foundWords,
  levelWords,
  boardData,
  hintsUsed,
  setHintsUsed,
  setHintHighlightedCells,
  canRevive,
  setShowGameOver,
  handleStart,
  handleDrag,
  handleCellEnd,
  isCellSelected,
  cellInteractions
}: UseGameBoardInteractionsParams) => {
  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    foundWords,
    levelWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells,
    canRevive,
    () => {},
    setShowGameOver,
    () => {}
  );

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, [setShowGameOver]);

  // Memoizar props de interação de células
  const cellInteractionProps = useMemo(() => ({
    handleCellStart: handleStart,
    handleCellMove: handleDrag,
    handleCellEnd,
    isCellSelected,
    ...cellInteractions
  }), [handleStart, handleDrag, handleCellEnd, isCellSelected, cellInteractions]);

  const gameActions = useMemo(() => ({
    useHint,
    handleRevive,
    handleGoHome,
    closeGameOver
  }), [useHint, handleRevive, handleGoHome, closeGameOver]);

  return {
    cellInteractionProps,
    gameActions
  };
};
