
import { useEffect } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
import { useWordValidation } from '@/hooks/useWordValidation';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardLogicStateProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoardLogicState = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardLogicStateProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  // Log detalhado do estado dos dados
  useEffect(() => {
    logger.info('🎮 GameBoardLogic otimizado renderizado', { 
      level,
      isMobile,
      isLoading,
      hasError: !!error,
      boardSize: boardData.board.length,
      levelWordsCount: levelWords.length,
      placedWordsCount: boardData.placedWords.length,
      timeLeft
    }, 'GAME_BOARD_LOGIC');
  }, [level, isMobile, isLoading, error, boardData, levelWords, timeLeft]);

  // Log quando os dados mudam
  useEffect(() => {
    if (boardData.board.length > 0) {
      logger.info('📋 Dados do tabuleiro otimizado recebidos', {
        level,
        isMobile,
        boardSize: boardData.board.length,
        levelWords,
        placedWords: boardData.placedWords.map(pw => pw.word),
        boardPreview: boardData.board.slice(0, 2).map(row => row.join(''))
      }, 'GAME_BOARD_LOGIC');
    }
  }, [boardData, levelWords, level, isMobile]);
  
  const { 
    selectedCells,
    previewCells,
    isSelecting, 
    metrics: selectionMetrics,
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected,
    isCellPreviewed
  } = useBoardInteraction();
  
  const { isValidWordDirection, isInLineWithSelection, fillIntermediateCells } = useWordValidation();

  const {
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    isLevelCompleted,
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver
  } = useGameLogic(level, timeLeft, levelWords, onWordFound, (levelScore) => {
    logger.info('🎉 Nível completado', { 
      level, 
      levelScore,
      foundWordsCount: foundWords.length,
      isMobile,
      selectionMetrics
    }, 'GAME_BOARD_LOGIC');
    onLevelComplete(levelScore);
  });

  return {
    // Board data
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    isMobile,
    
    // Selection state
    selectedCells,
    previewCells,
    isSelecting,
    selectionMetrics,
    
    // Game state
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    isLevelCompleted,
    
    // Interaction handlers
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    isCellSelected,
    isCellPreviewed,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    
    // Validation functions
    isValidWordDirection,
    isInLineWithSelection,
    fillIntermediateCells,
    
    // State setters
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    closeGameOver
  };
};
