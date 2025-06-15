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
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  // Estado do jogo consolidado
  const gameState = useGameState(level, timeLeft);
  
  // CORREÇÃO: Criar callback que chama onWordFound apenas uma vez
  const handleWordFoundCallback = useCallback((word: string, points: number) => {
    logger.info(`🎯 CALLBACK - Palavra encontrada: "${word}" = ${points} pontos`, { 
      word, 
      points,
      currentCount: gameState.foundWords.length 
    }, 'GAME_BOARD');
    onWordFound(word, points);
  }, [onWordFound, gameState.foundWords.length]);

  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords, handleWordFoundCallback);
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

  // Finalizar seleção com validação - CORREÇÃO CRÍTICA: Apenas uma adição por palavra
  const handleCellEnd = useCallback(() => {
    const finalSelection = handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      logger.info(`🔍 TENTATIVA - Seleção de palavra: "${word}"`, { 
        word, 
        beforeCount: gameState.foundWords.length,
        foundWords: gameState.foundWords.map(fw => fw.word)
      }, 'GAME_BOARD');
      
      const validatedWord = validateAndAddWord(word, finalSelection);
      if (validatedWord) {
        logger.info(`✅ ADICIONANDO - Palavra validada: "${word}"`, { 
          beforeCount: gameState.foundWords.length,
          word: validatedWord.word,
          points: validatedWord.points
        }, 'GAME_BOARD');
        
        // CORREÇÃO: Apenas UMA chamada para addFoundWord - não chamamos onWordFound aqui
        gameState.addFoundWord(validatedWord);
        
        // O callback onWordFound será chamado automaticamente pelo useGameState
        handleWordFoundCallback(validatedWord.word, validatedWord.points);
        
        logger.info(`📊 APÓS ADIÇÃO - Contagem atual: ${gameState.foundWords.length + 1}`, { 
          newCount: gameState.foundWords.length + 1
        }, 'GAME_BOARD');
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState, handleWordFoundCallback]);

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
