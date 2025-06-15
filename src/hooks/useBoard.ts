
import { useOptimizedBoard } from './useOptimizedBoard';
import { useIsMobile } from './use-mobile';
import { logger } from '@/utils/logger';

export const useBoard = (level: number) => {
  const isMobile = useIsMobile();
  const optimizedBoard = useOptimizedBoard(level);

  // Log simplificado
  logger.debug('🎮 useBoard simplificado', { 
    level, 
    isMobile,
    isLoading: optimizedBoard.isLoading,
    hasError: !!optimizedBoard.error,
    wordsCount: optimizedBoard.levelWords.length
  }, 'USE_BOARD');

  return {
    ...optimizedBoard,
    isMobile,
    debugInfo: `Simplificado: ${optimizedBoard.levelWords.length} palavras`
  };
};
