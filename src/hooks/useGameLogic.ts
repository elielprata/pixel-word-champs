
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { getPointsForWord } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

export const useGameLogic = (
  level: number,
  timeLeft: number,
  levelWords: string[],
  onWordFound: (word: string, points: number) => void,
  onLevelComplete: (levelScore: number) => void
) => {
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [permanentlyMarkedCells, setPermanentlyMarkedCells] = useState<Position[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [canRevive, setCanRevive] = useState(true);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);

  // Reset state when level changes
  useEffect(() => {
    setFoundWords([]);
    setPermanentlyMarkedCells([]);
    setHintsUsed(0);
  }, [level]);

  // Detecta quando o tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver]);

  // Verifica se completou o nível
  useEffect(() => {
    if (foundWords.length === 5 && !showLevelComplete) {
      const levelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
      setShowLevelComplete(true);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete]);

  const addFoundWord = (word: string, positions: Position[]) => {
    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    setFoundWords(prev => [...prev, newFoundWord]);
    setPermanentlyMarkedCells(prev => [...prev, ...positions]);
    onWordFound(word, points);
  };

  const isCellPermanentlyMarked = (row: number, col: number) => {
    return permanentlyMarkedCells.some(pos => pos.row === row && pos.col === col);
  };

  const isCellHintHighlighted = (row: number, col: number) => {
    return hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  return {
    foundWords,
    permanentlyMarkedCells,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    canRevive,
    hintHighlightedCells,
    setHintsUsed,
    setCanRevive,
    setShowGameOver,
    setShowLevelComplete,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted
  };
};
