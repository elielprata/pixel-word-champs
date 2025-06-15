
import { useMemo, useCallback } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useSimpleSelection } from '@/hooks/useSimpleSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useGameState } from '@/hooks/useGameState';
import { useCellInteractions } from '@/hooks/useCellInteractions';
import { useGameBoardProps } from '@/hooks/useGameBoardProps';
import { useGameBoardInteractions } from '@/hooks/useGameBoardInteractions';
import { logger } from '@/utils/logger';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { type Position } from '@/utils/boardUtils';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  // CORREÇÃO DEFINITIVA: Estado do jogo consolidado com callback integrado
  const gameState = useGameState(level, timeLeft, onLevelComplete);

  // CORREÇÃO DEFINITIVA: Validação sem callback
  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords);
  const cellInteractions = useCellInteractions(
    gameState.foundWords,
    gameState.permanentlyMarkedCells,
    gameState.hintHighlightedCells
  );

  const {
    startCell,
    currentCell,
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,
    getLinearPath
  } = useSimpleSelection();

  // CORREÇÃO DEFINITIVA: Finalizar seleção com validação - APENAS UMA FONTE DE VERDADE
  const handleCellEnd = useCallback(() => {
    const finalSelection = handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      logger.info(`🔍 TENTATIVA ÚNICA - Seleção de palavra: "${word}"`, { 
        word, 
        beforeCount: gameState.foundWords.length,
        foundWords: gameState.foundWords.map(fw => fw.word)
      }, 'GAME_BOARD');
      
      const validatedWord = validateAndAddWord(word, finalSelection);
      if (validatedWord) {
        logger.info(`✅ PALAVRA VALIDADA ÚNICA - "${word}"`, { 
          beforeCount: gameState.foundWords.length,
          word: validatedWord.word,
          points: validatedWord.points
        }, 'GAME_BOARD');
        
        // CORREÇÃO DEFINITIVA: APENAS UMA CHAMADA - sem callbacks redundantes
        gameState.addFoundWord(validatedWord);
        
        logger.info(`📊 PÓS-ADIÇÃO ÚNICA - Contagem esperada: ${gameState.foundWords.length + 1}`, { 
          expectedCount: gameState.foundWords.length + 1
        }, 'GAME_BOARD');
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState]);

  // Memoizar seleção atual
  const selectedCells: Position[] = useMemo(() => {
    if (isDragging && startCell && currentCell) {
      return getLinearPath(startCell, currentCell);
    }
    return [];
  }, [isDragging, startCell, currentCell, getLinearPath]);

  // Props agrupadas usando hook especializado
  const { boardProps, gameStateProps, modalProps } = useGameBoardProps({
    boardData,
    size,
    selectedCells,
    isDragging,
    foundWords: gameState.foundWords,
    levelWords,
    hintsUsed: gameState.hintsUsed,
    currentLevelScore: gameState.currentLevelScore,
    showGameOver: gameState.showGameOver,
    showLevelComplete: gameState.showLevelComplete
  });

  // Interações usando hook especializado
  const { cellInteractionProps, gameActions } = useGameBoardInteractions({
    foundWords: gameState.foundWords,
    levelWords,
    boardData,
    hintsUsed: gameState.hintsUsed,
    setHintsUsed: gameState.setHintsUsed,
    setHintHighlightedCells: gameState.setHintHighlightedCells,
    canRevive,
    setShowGameOver: gameState.setShowGameOver,
    handleStart,
    handleDrag,
    handleCellEnd,
    isCellSelected,
    cellInteractions
  });

  return {
    isLoading,
    error,
    isMobile,
    boardProps,
    gameStateProps,
    modalProps,
    cellInteractionProps,
    gameActions
  };
};
