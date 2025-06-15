
import { useCallback, useMemo } from 'react';
import { useSimpleSelection } from './useSimpleSelection';
import { useGameValidation } from './useGameValidation';
import { isLinearPath } from './word-selection/validateLinearPath';
import { type Position } from '@/utils/boardUtils';

interface UseGameBoardSelectionProps {
  boardData: { board: string[][]; placedWords: any[] };
  foundWords: any[];
  levelWords: string[];
  onWordFound: (word: string, points: number) => void;
  addFoundWord: (word: any) => void;
}

export const useGameBoardSelection = ({
  boardData,
  foundWords,
  levelWords,
  onWordFound,
  addFoundWord
}: UseGameBoardSelectionProps) => {
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

  const { validateAndAddWord } = useGameValidation(foundWords, levelWords, onWordFound);

  // Handle cell end with validation
  const handleCellEnd = useCallback(() => {
    const selection = handleEnd();

    if (selection.length >= 3 && isLinearPath(selection)) {
      const word = selection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      const validatedWord = validateAndAddWord(word, selection);
      if (validatedWord) {
        addFoundWord(validatedWord);
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, addFoundWord]);

  // Current selection
  const selectedCells: Position[] = useMemo(() => {
    if (isDragging && startCell && currentCell) {
      return getLinearPath(startCell, currentCell);
    }
    return [];
  }, [isDragging, startCell, currentCell, getLinearPath]);

  return {
    selectedCells,
    isDragging,
    handleStart,
    handleDrag,
    handleCellEnd,
    isCellSelected
  };
};
