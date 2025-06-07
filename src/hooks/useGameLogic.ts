
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGamePointsConfig } from './useGamePointsConfig';

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
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);
  
  const { getPointsForWord } = useGamePointsConfig();

  // Reset state when level changes
  useEffect(() => {
    console.log(`Resetting game state for level ${level}`);
    setFoundWords([]);
    setPermanentlyMarkedCells([]);
    setHintsUsed(0);
    setShowLevelComplete(false);
    setShowGameOver(false);
    setHintHighlightedCells([]);
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
      console.log(`Level ${level} completed with score ${levelScore}`);
      setShowLevelComplete(true);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete, level]);

  const addFoundWord = (word: string, positions: Position[]) => {
    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    console.log(`Palavra encontrada: ${word} = ${points} pontos (usando configuração do painel admin)`);
    
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
    hintHighlightedCells,
    setHintsUsed,
    setShowGameOver,
    setShowLevelComplete,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted
  };
};
