
import { useState, useEffect } from 'react';
import { generateBoard, getBoardSize, getBoardWidth } from '@/utils/boardUtils';
import { useSimpleWordSelection } from './useSimpleWordSelection';
import { useIsMobile } from './use-mobile';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: any[];
}

interface OptimizedBoardResult {
  boardData: BoardData;
  size: number;
  width: number;
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  source: 'database' | 'emergency';
}

export const useOptimizedBoard = (level: number): OptimizedBoardResult => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const isMobile = useIsMobile();
  
  const { levelWords, isLoading: wordsLoading, error: wordsError, source } = useSimpleWordSelection(level);

  // Dimensões fixas do tabuleiro
  const size = getBoardSize(level); // 12 altura
  const width = getBoardWidth(level); // 8 largura

  useEffect(() => {
    if (wordsLoading || levelWords.length === 0) return;

    logger.info('🎲 Gerando tabuleiro consolidado', { 
      level, 
      size,
      width,
      wordsCount: levelWords.length,
      source,
      isMobile
    }, 'OPTIMIZED_BOARD');

    try {
      const result = generateBoard(levelWords, level);
      
      if (result) {
        setBoardData(result.boardData);
        
        logger.info('✅ Tabuleiro consolidado gerado', { 
          level,
          size,
          width,
          wordsPlaced: result.boardData.placedWords.length,
          source,
          isMobile
        }, 'OPTIMIZED_BOARD');
      } else {
        throw new Error('Falha na geração do tabuleiro consolidado');
      }
    } catch (error) {
      logger.error('❌ Erro na geração consolidada', { error, level, source, isMobile }, 'OPTIMIZED_BOARD');
    }
  }, [levelWords, level, wordsLoading, source, size, width, isMobile]);

  const isLoading = wordsLoading || boardData.board.length === 0;

  return {
    boardData,
    size,
    width,
    levelWords,
    isLoading,
    error: wordsError,
    source
  };
};
