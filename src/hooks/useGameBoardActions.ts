
import { useMemo } from 'react';
import { useGameInteractions } from './useGameInteractions';
import { type Position } from '@/utils/boardUtils';

interface UseGameBoardActionsProps {
  foundWords: any[];
  levelWords: string[];
  boardData: { board: string[][]; placedWords: any[] };
  hintsUsed: number;
  setHintsUsed: (value: number | ((prev: number) => number)) => void;
  setHintHighlightedCells: (positions: Position[]) => void;
  canRevive: boolean;
  setShowGameOver: (value: boolean) => void;
  onTimeUp: () => void;
}

export const useGameBoardActions = ({
  foundWords,
  levelWords,
  boardData,
  hintsUsed,
  setHintsUsed,
  setHintHighlightedCells,
  canRevive,
  setShowGameOver,
  onTimeUp
}: UseGameBoardActionsProps) => {
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
    onTimeUp
  );

  const actions = useMemo(() => ({
    useHint,
    handleRevive,
    handleGoHome
  }), [useHint, handleRevive, handleGoHome]);

  return actions;
};
