
import { useCallback } from 'react';
import { BoardGenerator } from '@/utils/boardGenerator';
import { getDefaultWordsForSize } from '@/utils/levelConfiguration';
import { type PlacedWord } from '@/utils/boardUtils';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoardGeneration = () => {
  const generateBoard = useCallback((size: number, words: string[]): BoardData => {
    // Sempre gerar um tabuleiro, mesmo se não houver palavras
    if (words.length === 0) {
      console.log('⚠️ Gerando tabuleiro com palavras padrão...');
      const defaultWords = getDefaultWordsForSize(size);
      return BoardGenerator.generateSmartBoard(size, defaultWords);
    }
    return BoardGenerator.generateSmartBoard(size, words);
  }, []);

  return { generateBoard };
};
