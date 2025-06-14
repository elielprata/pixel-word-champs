
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
  const { levelWords, isLoading: wordsLoading, error: wordsError, loadingStep, metrics } = useOptimizedWordSelection(level);
  const { generateBoard } = useBoardGeneration();
  const isMobile = useIsMobile();

  useEffect(() => {
    logger.info('🎮 Board otimizado híbrido inicializado', { 
      level, 
      isMobile,
      wordsLoading,
      levelWordsCount: levelWords.length,
      metrics
    }, 'OPTIMIZED_BOARD');
  }, [level, isMobile, metrics]);

  // Gerar tabuleiro quando as palavras estiverem prontas
  useEffect(() => {
    if (!wordsLoading && levelWords.length > 0) {
      const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
      
      logger.info('🚀 Gerando tabuleiro híbrido otimizado', { 
        level, 
        size, 
        isMobile,
        wordsCount: levelWords.length,
        words: levelWords,
        metrics
      }, 'OPTIMIZED_BOARD');
      
      try {
        const newBoardData = generateBoard(size, levelWords);
        setBoardData(newBoardData);
        setBoardError(null);
        
        logger.info('✅ Tabuleiro híbrido gerado', { 
          wordsPlaced: newBoardData.placedWords.length,
          boardSize: newBoardData.board.length,
          isMobile,
          cacheHit: metrics?.cacheHit || false,
          processingTime: metrics?.processingTime || 0
        }, 'OPTIMIZED_BOARD');
        
      } catch (error) {
        logger.error('❌ Erro na geração do tabuleiro híbrido', { 
          error, 
          isMobile,
          level,
          levelWords,
          metrics
        }, 'OPTIMIZED_BOARD');
        setBoardError(error instanceof Error ? error.message : 'Erro na geração do tabuleiro');
      }
    }
  }, [levelWords, wordsLoading, generateBoard, level, isMobile, metrics]);

  const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);
  const isLoading = wordsLoading || (levelWords.length > 0 && boardData.board.length === 0);
  const error = wordsError || boardError;

  return {
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    loadingStep,
    metrics
  };
};
