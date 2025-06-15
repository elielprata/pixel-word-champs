
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
  // ETAPA 4: Props otimizadas com constante de palavras alvo
  const GAME_TARGET_WORDS = 5;

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
    currentLevelScore,
    targetWords: GAME_TARGET_WORDS // ETAPA 4: Sempre 5 palavras como objetivo
  }), [foundWords, levelWords, hintsUsed, currentLevelScore]);

  const modalProps = useMemo(() => ({
    showGameOver,
    showLevelComplete,
    gameCompleted: foundWords.length >= GAME_TARGET_WORDS // ETAPA 4: Verificação otimizada
  }), [showGameOver, showLevelComplete, foundWords.length]);

  return {
    boardProps,
    gameStateProps,
    modalProps,
    GAME_TARGET_WORDS // ETAPA 4: Exportar constante para uso externo
  };
};
