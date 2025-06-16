
import { useMemo, useCallback } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useSimpleSelection } from '@/hooks/useSimpleSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameValidation } from '@/hooks/useGameValidation';
import { useGameState } from '@/hooks/useGameState';
import { useCellInteractions } from '@/hooks/useCellInteractions';
import { useSelectionLock } from '@/hooks/useSelectionLock';
import { logger } from '@/utils/logger';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { type Position } from '@/utils/boardUtils';
import { GAME_CONSTANTS } from '@/constants/game';

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
  
  // Estado do jogo consolidado
  const gameState = useGameState(level, timeLeft, onLevelComplete);

  // Sistema de lock para evitar duplicação
  const { isProcessing, acquireLock, releaseLock } = useSelectionLock();

  // Validação de palavras (única fonte de verdade)
  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords);

  // Interações com células
  const cellInteractions = useCellInteractions(
    gameState.foundWords,
    gameState.permanentlyMarkedCells,
    gameState.hintHighlightedCells
  );

  // Seleção simples (única fonte de verdade)
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

  // CORREÇÃO DEFINITIVA: Finalizar seleção com LOCK PROTECTION
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
      }, 'GAME_BOARD');
      
      // PROTEÇÃO CRÍTICA: Tentar adquirir lock antes de processar
      if (!acquireLock(word)) {
        logger.warn(`⚠️ SELEÇÃO BLOQUEADA - Lock não pôde ser adquirido para "${word}"`, { 
          word,
          isProcessing 
        }, 'GAME_BOARD');
        return;
      }

      try {
        const validatedWord = validateAndAddWord(word, finalSelection);
        if (validatedWord) {
          logger.info(`✅ PALAVRA VALIDADA COM LOCK - "${word}" = ${validatedWord.points} pontos`, { 
            word: validatedWord.word,
            points: validatedWord.points,
            beforeCount: gameState.foundWords.length
          }, 'GAME_BOARD');
          
          // ÚNICA chamada para adicionar palavra
          gameState.addFoundWord(validatedWord);
        }
      } finally {
        // SEMPRE liberar o lock, mesmo em caso de erro
        releaseLock();
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState, acquireLock, releaseLock, isProcessing]);

  // Seleção atual em tempo real
  const selectedCells: Position[] = useMemo(() => {
    if (isDragging && startCell && currentCell) {
      return getLinearPath(startCell, currentCell);
    }
    return [];
  }, [isDragging, startCell, currentCell, getLinearPath]);

  // Função de cor para palavras
  const getWordColor = useCallback((wordIndex: number) => {
    return GAME_CONSTANTS.WORD_COLORS[wordIndex % GAME_CONSTANTS.WORD_COLORS.length];
  }, []);

  // Verificar índice da palavra em uma célula
  const getCellWordIndex = useCallback((row: number, col: number) => {
    return gameState.foundWords.findIndex(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  }, [gameState.foundWords]);

  // Ações do jogo simplificadas
  const useHint = useCallback(() => {
    if (gameState.hintsUsed >= GAME_CONSTANTS.MAX_HINTS_PER_LEVEL) {
      logger.warn('⚠️ Limite de dicas atingido', { used: gameState.hintsUsed, max: GAME_CONSTANTS.MAX_HINTS_PER_LEVEL }, 'GAME_BOARD');
      return;
    }

    const remainingWords = levelWords.filter(word => 
      !gameState.foundWords.some(fw => fw.word === word)
    );

    if (remainingWords.length === 0) {
      logger.warn('⚠️ Não há palavras restantes para dica', {}, 'GAME_BOARD');
      return;
    }

    const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    const placedWord = boardData.placedWords.find(pw => pw.word === randomWord);
    
    if (placedWord) {
      gameState.setHintHighlightedCells(placedWord.positions);
      gameState.setHintsUsed(prev => prev + 1);
      
      logger.info(`💡 Dica usada para palavra "${randomWord}"`, { 
        word: randomWord,
        hintsUsed: gameState.hintsUsed + 1 
      }, 'GAME_BOARD');

      // Remover highlight após 3 segundos
      setTimeout(() => {
        gameState.setHintHighlightedCells([]);
      }, 3000);
    }
  }, [gameState, levelWords, boardData.placedWords]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const closeGameOver = useCallback(() => {
    gameState.setShowGameOver(false);
  }, [gameState]);

  return {
    isLoading,
    error,
    isMobile,
    // Props do tabuleiro
    boardProps: {
      boardData,
      size,
      selectedCells,
      isDragging: isDragging && !isProcessing // Disable dragging when processing
    },
    // Props do estado do jogo
    gameStateProps: {
      foundWords: gameState.foundWords,
      levelWords,
      hintsUsed: gameState.hintsUsed,
      currentLevelScore: gameState.currentLevelScore
    },
    // Props dos modais
    modalProps: {
      showGameOver: gameState.showGameOver,
      showLevelComplete: gameState.showLevelComplete
    },
    // Props de interação com células
    cellInteractionProps: {
      handleCellStart: isProcessing ? () => {} : handleStart, // Disable start when processing
      handleCellMove: isProcessing ? () => {} : handleDrag,   // Disable move when processing
      handleCellEnd: isProcessing ? () => {} : handleCellEnd, // Disable end when processing
      isCellSelected,
      isCellPermanentlyMarked: cellInteractions.isCellPermanentlyMarked,
      isCellHintHighlighted: cellInteractions.isCellHintHighlighted,
      getWordColor,
      getCellWordIndex
    },
    // Ações do jogo
    gameActions: {
      useHint,
      handleGoHome,
      closeGameOver
    }
  };
};
