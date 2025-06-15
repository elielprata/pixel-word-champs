
import { useState, useEffect } from 'react';
import { generateBoard } from '@/utils/boardUtils';
import { useSimpleWordSelection } from './useSimpleWordSelection';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: any[];
}

interface OptimizedBoardResult {
  boardData: BoardData;
  size: number;
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
}

export const useOptimizedBoard = (level: number): OptimizedBoardResult => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [size, setSize] = useState<number>(0);
  
  const { levelWords, isLoading, error } = useSimpleWordSelection(level);

  useEffect(() => {
    if (levelWords.length === 0 || isLoading) return;

    logger.info('🎲 Gerando tabuleiro otimizado', { 
      level, 
      wordsCount: levelWords.length 
    }, 'OPTIMIZED_BOARD');

    try {
      const result = generateBoard(levelWords, level);
      
      if (result) {
        setBoardData(result.boardData);
        setSize(result.size);
        
        logger.info('✅ Tabuleiro gerado com sucesso', { 
          level,
          size: result.size,
          wordsPlaced: result.boardData.placedWords.length
        }, 'OPTIMIZED_BOARD');
      } else {
        throw new Error('Falha na geração do tabuleiro');
      }
    } catch (error) {
      logger.error('❌ Erro na geração do tabuleiro', { error, level }, 'OPTIMIZED_BOARD');
    }
  }, [levelWords, level, isLoading]);

  return {
    boardData,
    size,
    levelWords,
    isLoading,
    error
  };
};
