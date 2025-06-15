
import { useOptimizedBoard } from './useOptimizedBoard';
import { useIsMobile } from './use-mobile';
import { useGameBoardState } from './useGameBoardState';
import { useGameBoardSelection } from './useGameBoardSelection';
import { useGameBoardActions } from './useGameBoardActions';
import { useCellInteractions } from './useCellInteractions';
import { logger } from '@/utils/logger';

interface UseBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
  onTimeUp: () => void;
}

export const useBoard = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete,
  canRevive,
  onTimeUp
}: UseBoardProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, width, levelWords, isLoading, error, source } = useOptimizedBoard(level);

  // Game state management
  const { gameState, currentLevelScore } = useGameBoardState({
    level,
    timeLeft,
    levelWords,
    onLevelComplete
  });

  // Selection logic
  const selectionProps = useGameBoardSelection({
    boardData,
    foundWords: gameState.foundWords,
    levelWords,
    onWordFound,
    addFoundWord: gameState.addFoundWord
  });

  // Game actions
  const actions = useGameBoardActions({
    foundWords: gameState.foundWords,
    levelWords,
    boardData,
    hintsUsed: gameState.hintsUsed,
    setHintsUsed: gameState.setHintsUsed,
    setHintHighlightedCells: gameState.setHintHighlightedCells,
    canRevive,
    setShowGameOver: gameState.setShowGameOver,
    onTimeUp
  });

  // Cell interactions
  const cellInteractions = useCellInteractions(
    gameState.foundWords,
    gameState.permanentlyMarkedCells,
    gameState.hintHighlightedCells
  );

  logger.debug('🎮 useBoard refatorado', { 
    level, 
    isMobile,
    isLoading,
    hasError: !!error,
    wordsCount: levelWords.length,
    foundWords: gameState.foundWords.length
  }, 'USE_BOARD');

  return {
    // Board data
    boardData,
    size,
    width,
    levelWords,
    isLoading,
    error,
    source,
    isMobile,

    // Game state
    foundWords: gameState.foundWords,
    hintsUsed: gameState.hintsUsed,
    currentLevelScore,
    showGameOver: gameState.showGameOver,
    showLevelComplete: gameState.showLevelComplete,
    hintHighlightedCells: gameState.hintHighlightedCells,
    permanentlyMarkedCells: gameState.permanentlyMarkedCells,

    // Selection
    ...selectionProps,

    // Actions
    ...actions,

    // Cell interactions
    ...cellInteractions,

    // Debug info
    debugInfo: `Refatorado: ${levelWords.length} palavras, ${gameState.foundWords.length} encontradas`
  };
};
