
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
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  
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
    setIsLevelCompleted(false);
  }, [level]);

  // Detecta quando o tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver]);

  // Verifica se completou o nível
  useEffect(() => {
    if (foundWords.length === 5 && !showLevelComplete && !isLevelCompleted) {
      const levelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
      console.log(`Level ${level} completed with score ${levelScore}`);
      setShowLevelComplete(true);
      setIsLevelCompleted(true);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete, level, isLevelCompleted]);

  const addFoundWord = (word: string, positions: Position[]) => {
    const points = getPointsForWord(word);
    const newFoundWord = { word, positions: [...positions], points };
    
    console.log(`Palavra encontrada: ${word} = ${points} pontos (usando configuração do painel admin)`);
    
    setFoundWords(prev => [...prev, newFoundWord]);
    setPermanentlyMarkedCells(prev => [...prev, ...positions]);
    
    // Só contabiliza pontos se o nível for completado
    // Por agora, chamamos onWordFound para feedback visual, mas a pontuação final só conta quando completar
    onWordFound(word, 0); // Não adiciona pontos até completar o nível
  };

  const isCellPermanentlyMarked = (row: number, col: number) => {
    return permanentlyMarkedCells.some(pos => pos.row === row && pos.col === col);
  };

  const isCellHintHighlighted = (row: number, col: number) => {
    return hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  // Função para fechar o modal do Game Over (usado no revive)
  const closeGameOver = () => {
    setShowGameOver(false);
  };

  return {
    foundWords,
    permanentlyMarkedCells,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    hintHighlightedCells,
    isLevelCompleted,
    setHintsUsed,
    setShowGameOver,
    setShowLevelComplete,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver
  };
};
