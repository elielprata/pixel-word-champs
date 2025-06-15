
import { useMemo, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

export const useCellInteractions = (
  foundWords: FoundWord[],
  permanentlyMarkedCells: Position[],
  hintHighlightedCells: Position[]
) => {
  // Otimizar verificações com Map para O(1) lookup
  const permanentCellsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    permanentlyMarkedCells.forEach(pos => {
      map.set(`${pos.row}-${pos.col}`, true);
    });
    return map;
  }, [permanentlyMarkedCells]);

  const hintCellsMap = useMemo(() => {
    const map = new Map<string, boolean>();
    hintHighlightedCells.forEach(pos => {
      map.set(`${pos.row}-${pos.col}`, true);
    });
    return map;
  }, [hintHighlightedCells]);

  const wordIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    foundWords.forEach((fw, index) => {
      fw.positions.forEach(pos => {
        map.set(`${pos.row}-${pos.col}`, index);
      });
    });
    return map;
  }, [foundWords]);

  const isCellPermanentlyMarked = useCallback((row: number, col: number) => {
    return permanentCellsMap.has(`${row}-${col}`);
  }, [permanentCellsMap]);

  const isCellHintHighlighted = useCallback((row: number, col: number) => {
    return hintCellsMap.has(`${row}-${col}`);
  }, [hintCellsMap]);

  const getCellWordIndex = useCallback((row: number, col: number) => {
    return wordIndexMap.get(`${row}-${col}`) ?? -1;
  }, [wordIndexMap]);

  const getWordColor = useCallback((wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-violet-600',
      'bg-gradient-to-br from-emerald-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-amber-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-teal-600',
    ];
    return colors[wordIndex % colors.length];
  }, []);

  return {
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    getCellWordIndex,
    getWordColor
  };
};
