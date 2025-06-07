
import { useState, useCallback, useEffect } from 'react';
import { getBoardSize, getLevelWords, type PlacedWord } from '@/utils/boardUtils';
import { BoardGenerator } from '@/utils/boardGenerator';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const generateBoard = useCallback((size: number, words: string[]): BoardData => {
    return BoardGenerator.generateSmartBoard(size, words);
  }, []);

  const size = getBoardSize(level);
  const levelWords = getLevelWords(level);
  const [boardData, setBoardData] = useState<BoardData>(() => generateBoard(size, levelWords));

  // Regenerate board when level changes
  useEffect(() => {
    const newSize = getBoardSize(level);
    const newLevelWords = getLevelWords(level);
    setBoardData(generateBoard(newSize, newLevelWords));
  }, [level, generateBoard]);

  return {
    boardData,
    size,
    levelWords
  };
};
