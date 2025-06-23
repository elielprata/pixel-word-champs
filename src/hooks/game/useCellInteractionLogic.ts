
import { useCallback } from 'react';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useSelectionLock } from '@/hooks/useSelectionLock';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { logger } from '@/utils/logger';
import { type Position } from '@/utils/boardUtils';

interface CellInteractionProps {
  boardData: { board: string[][] };
  gameState: any;
  levelWords: string[];
  handleEnd: () => Position[];
  isProcessing: boolean;
}

export const useCellInteractionLogic = ({
  boardData,
  gameState,
  levelWords,
  handleEnd,
  isProcessing
}: CellInteractionProps) => {
  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords);
  const { acquireLock, releaseLock } = useSelectionLock();

  const handleCellEnd = useCallback(() => {
    const finalSelection = handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      logger.info(`🔍 TENTATIVA DE SELEÇÃO COM LOCK - Palavra: "${word}"`, { 
        word, 
        positions: finalSelection,
        isProcessing,
        beforeCount: gameState.foundWords.length,
        foundWords: gameState.foundWords.map(fw => fw.word)
      }, 'CELL_INTERACTION');
      
      if (!acquireLock(word)) {
        logger.warn(`⚠️ SELEÇÃO BLOQUEADA - Lock não pôde ser adquirido para "${word}"`, { 
          word,
          isProcessing 
        }, 'CELL_INTERACTION');
        return;
      }

      try {
        const validatedWord = validateAndAddWord(word, finalSelection);
        if (validatedWord) {
          logger.info(`✅ PALAVRA VALIDADA COM LOCK - "${word}" = ${validatedWord.points} pontos`, { 
            word: validatedWord.word,
            points: validatedWord.points,
            beforeCount: gameState.foundWords.length
          }, 'CELL_INTERACTION');
          
          gameState.addFoundWord(validatedWord.word, validatedWord.points, finalSelection);
        }
      } finally {
        releaseLock();
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState, acquireLock, releaseLock, isProcessing]);

  return { handleCellEnd };
};
