
import { useState, useEffect } from 'react';
import { useBoardGeneration } from './useBoardGeneration';
import { useSimpleWordSelection } from './useSimpleWordSelection';
import { getBoardSize, getMobileBoardSize, type PlacedWord } from '@/utils/boardUtils';
import { useIsMobile } from './use-mobile';
import { logger } from '@/utils/logger';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

interface OptimizedBoardResult {
  boardData: BoardData;
  size: number;
  levelWords: string[];
  isLoading: boolean;
  error: string | null;
  isWordSelectionError: boolean;
}

export const useOptimizedBoard = (level: number): OptimizedBoardResult => {
  const [boardData, setBoardData] = useState<BoardData>({ board: [], placedWords: [] });
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Usar seleção simples sem fallbacks
  const { levelWords, isLoading: wordsLoading, error: wordsError } = useSimpleWordSelection(level);
  const { generateBoard } = useBoardGeneration();

  const size = isMobile ? getMobileBoardSize(level) : getBoardSize(level);

  useEffect(() => {
    if (wordsLoading || levelWords.length === 0) return;

    logger.info('🏗️ Gerando tabuleiro otimizado', {
      level,
      isMobile,
      size,
      wordsCount: levelWords.length,
      words: levelWords
    }, 'OPTIMIZED_BOARD');

    try {
      const newBoardData = generateBoard(size, levelWords);
      setBoardData(newBoardData);
      setError(null);
      
      logger.info('✅ Tabuleiro otimizado gerado', {
        level,
        placedWords: newBoardData.placedWords.length,
        totalWords: levelWords.length
      }, 'OPTIMIZED_BOARD');
      
    } catch (err) {
      logger.error('❌ Erro ao gerar tabuleiro otimizado', { err }, 'OPTIMIZED_BOARD');
      setError(err instanceof Error ? err.message : 'Erro na geração do tabuleiro');
    }
  }, [levelWords, wordsLoading, level, size, isMobile, generateBoard]);

  // Combinar erros de palavras e tabuleiro
  const combinedError = wordsError || error;
  const isWordSelectionError = !!wordsError;

  return {
    boardData,
    size,
    levelWords,
    isLoading: wordsLoading,
    error: combinedError,
    isWordSelectionError
  };
};
