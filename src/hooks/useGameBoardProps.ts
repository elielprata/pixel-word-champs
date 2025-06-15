
import { useMemo } from 'react';
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

interface UseGameBoardPropsParams {
  boardData: BoardData;
  size: number;
  selectedCells: Position[];
  isDragging: boolean;
  foundWords: FoundWord[];
  levelWords: string[];
  hintsUsed: number;
  currentLevelScore: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
}

export const useGameBoardProps = ({
  boardData,
  size,
  selectedCells,
  isDragging,
  foundWords,
  levelWords,
  hintsUsed,
  currentLevelScore,
  showGameOver,
  showLevelComplete
}: UseGameBoardPropsParams) => {
  // Memoizar props agrupadas
  const boardProps = useMemo(() => ({
    boardData,
    size,
    selectedCells,
    isDragging
  }), [boardData, size, selectedCells, isDragging]);

  const gameStateProps = useMemo(() => ({
    foundWords,
    levelWords,
    hintsUsed,
    currentLevelScore
  }), [foundWords, levelWords, hintsUsed, currentLevelScore]);

  const modalProps = useMemo(() => ({
    showGameOver,
    showLevelComplete
  }), [showGameOver, showLevelComplete]);

  return {
    boardProps,
    gameStateProps,
    modalProps
  };
};
