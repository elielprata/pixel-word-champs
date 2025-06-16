
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
  const generateBoard = useCallback((height: number, words: string[]): BoardData => {
    logger.debug('Gerando tabuleiro 8x12', { height, wordsCount: words.length }, 'BOARD_GENERATION');
    
    // Sempre gerar um tabuleiro, mesmo se não houver palavras
    if (words.length === 0) {
      logger.warn('Gerando tabuleiro com palavras padrão', { height }, 'BOARD_GENERATION');
      const defaultWords = getDefaultWordsForSize(12); // usar largura máxima de 12
      return BoardGenerator.generateSmartBoard(height, defaultWords);
    }
    
    const boardData = BoardGenerator.generateSmartBoard(height, words);
    logger.info('Tabuleiro 8x12 gerado com sucesso', { 
      height, 
      wordsPlaced: boardData.placedWords.length 
    }, 'BOARD_GENERATION');
    
    return boardData;
  }, []);

  return { generateBoard };
};
