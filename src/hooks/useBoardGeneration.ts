
import { useCallback } from 'react';
import { BoardGenerator } from '@/utils/boardGenerator';
import { getDefaultWordsForSize } from '@/utils/levelConfiguration';
import { type PlacedWord } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoardGeneration = () => {
  const generateBoard = useCallback((size: number, words: string[]): BoardData => {
    logger.debug('Gerando tabuleiro', { size, wordsCount: words.length }, 'BOARD_GENERATION');
    
    // Sempre gerar um tabuleiro, mesmo se não houver palavras
    if (words.length === 0) {
      logger.warn('Gerando tabuleiro com palavras padrão', { size }, 'BOARD_GENERATION');
      const defaultWords = getDefaultWordsForSize(size);
      return BoardGenerator.generateSmartBoard(size, defaultWords);
    }
    
    const boardData = BoardGenerator.generateSmartBoard(size, words);
    logger.info('Tabuleiro gerado com sucesso', { 
      size, 
      wordsPlaced: boardData.placedWords.length 
    }, 'BOARD_GENERATION');
    
    return boardData;
  }, []);

  return { generateBoard };
};
