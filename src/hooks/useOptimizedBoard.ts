
import { useState, useEffect } from 'react';
import { getBoardSize, getMobileBoardSize, type PlacedWord } from '@/utils/boardUtils';
import { useOptimizedWordSelection } from './useOptimizedWordSelection';
import { useBoardGeneration } from './useBoardGeneration';
import { useIsMobile } from './use-mobile';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useOptimizedBoard = (level: number) => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [boardError, setBoardError] = useState<string | null>(null);
  const { levelWords, isLoading: wordsLoading, error: wordsError, loadingStep } = useOptimizedWordSelection(level);
  const { generateBoard } = useBoardGeneration();
  const isMobile = useIsMobile();

  useEffect(() => {
    logger.info('🎮 Board otimizado inicializado', { 
      level, 
      isMobile,
      wordsLoading,
      levelWordsCount: levelWords.length
    }, 'OPTIMIZED_BOARD');
  }, [level, isMobile]);

  // Gerar tabuleiro quando as palavras estiverem prontas
  useEffect(() => {
    if (!wordsLoading && levelWords.length > 0) {
      const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
      
      logger.info('🚀 Gerando tabuleiro otimizado', { 
        level, 
        size, 
        isMobile,
        wordsCount: levelWords.length,
        words: levelWords
      }, 'OPTIMIZED_BOARD');
      
      try {
        const newBoardData = generateBoard(size, levelWords);
        setBoardData(newBoardData);
        setBoardError(null);
        
        logger.info('✅ Tabuleiro otimizado gerado', { 
          wordsPlaced: newBoardData.placedWords.length,
          boardSize: newBoardData.board.length,
          isMobile
        }, 'OPTIMIZED_BOARD');
        
      } catch (error) {
        logger.error('❌ Erro na geração do tabuleiro otimizado', { 
          error, 
          isMobile,
          level,
          levelWords
        }, 'OPTIMIZED_BOARD');
        setBoardError(error instanceof Error ? error.message : 'Erro na geração do tabuleiro');
      }
    }
  }, [levelWords, wordsLoading, generateBoard, level, isMobile]);

  const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
  const isLoading = wordsLoading || (levelWords.length > 0 && boardData.board.length === 0);
  const error = wordsError || boardError;

  return {
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    loadingStep
  };
};
