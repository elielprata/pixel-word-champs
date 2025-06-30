
import { useCallback } from 'react';
import { useSimpleSelection } from './useSimpleSelection';
import { useWordValidation } from './useWordValidation';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface UseSimpleSelectionWithValidationProps {
  boardData?: { board: string[][]; placedWords: any[] };
  levelWords: string[];
  foundWords: FoundWord[];
  onWordFound: (foundWord: FoundWord) => void;
}

export const useSimpleSelectionWithValidation = ({
  boardData,
  levelWords,
  foundWords,
  onWordFound
}: UseSimpleSelectionWithValidationProps) => {
  const { getPointsForWord } = useGamePointsConfig();
  const selection = useSimpleSelection();
  
  const { validateAndConfirmWord } = useWordValidation({
    boardData,
    levelWords,
    foundWords,
    onWordFound,
    getPointsForWord
  });

  // Finalizar seleção com validação automática
  const handleEnd = useCallback(() => {
    const selectedPath = selection.handleEnd();
    
    // Validar apenas se temos um caminho válido (mais de 1 célula)
    if (selectedPath.length > 1) {
      validateAndConfirmWord(selectedPath);
    }
    
    return selectedPath;
  }, [selection, validateAndConfirmWord]);

  return {
    ...selection,
    handleEnd, // Substituir o handleEnd original pela versão com validação
  };
};
