
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameState {
  foundWords: FoundWord[];
  hintsUsed: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
  isLevelCompleted: boolean;
}

export const useGameState = (level: number, timeLeft: number) => {
  const [state, setState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    showGameOver: false,
    showLevelComplete: false,
    hintHighlightedCells: [],
    permanentlyMarkedCells: [],
    isLevelCompleted: false
  });

  // Reset state quando muda o nível
  useEffect(() => {
    logger.info(`Resetting game state for level ${level}`);
    setState({
      foundWords: [],
      hintsUsed: 0,
      showGameOver: false,
      showLevelComplete: false,
      hintHighlightedCells: [],
      permanentlyMarkedCells: [],
      isLevelCompleted: false
    });
  }, [level]);

  // Game Over quando tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver) {
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver]);

  const addFoundWord = (newFoundWord: FoundWord) => {
    setState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, newFoundWord],
      permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
    }));
  };

  const setHintsUsed = (value: number | ((prev: number) => number)) => {
    setState(prev => ({ 
      ...prev, 
      hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value 
    }));
  };

  const setHintHighlightedCells = (positions: Position[]) => {
    setState(prev => ({ ...prev, hintHighlightedCells: positions }));
  };

  const setShowGameOver = (value: boolean) => {
    setState(prev => ({ ...prev, showGameOver: value }));
  };

  const setShowLevelComplete = (value: boolean) => {
    setState(prev => ({ ...prev, showLevelComplete: value }));
  };

  const setIsLevelCompleted = (value: boolean) => {
    setState(prev => ({ ...prev, isLevelCompleted: value }));
  };

  return {
    ...state,
    addFoundWord,
    setHintsUsed,
    setHintHighlightedCells,
    setShowGameOver,
    setShowLevelComplete,
    setIsLevelCompleted
  };
};
