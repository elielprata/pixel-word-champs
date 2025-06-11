
import { useState, useEffect } from 'react';
import { getBoardSize, type PlacedWord } from '@/utils/boardUtils';
import { useWordSelection } from './useWordSelection';
import { useBoardGeneration } from './useBoardGeneration';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number, category?: string) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const { levelWords } = useWordSelection(level, category);
  const { generateBoard } = useBoardGeneration();

  // Regenerate board when level, words, or category change
  useEffect(() => {
    if (levelWords.length > 0) {
      const size = getBoardSize(level);
      console.log(`🎯 Gerando tabuleiro com palavras${category ? ` da categoria ${category}` : ''}:`, levelWords);
      const newBoardData = generateBoard(size, levelWords);
      console.log('🎲 Tabuleiro gerado:', newBoardData);
      setBoardData(newBoardData);
    }
  }, [level, levelWords, generateBoard, category]);

  const size = getBoardSize(level);

  return {
    boardData,
    size,
    levelWords
  };
};
