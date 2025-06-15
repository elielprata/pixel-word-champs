
import { useEffect } from "react";
import { useOptimizedBoard } from "@/hooks/useOptimizedBoard";
import { useSimpleSelection } from "@/hooks/useSimpleSelection";
import { useGameLogic } from "@/hooks/useGameLogic";
import { useIsMobile } from "@/hooks/use-mobile";
import { logger } from "@/utils/logger";
import { type Position } from "@/utils/boardUtils";

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

  const {
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver,
  } = useGameLogic(level, timeLeft, levelWords, onWordFound, onLevelComplete);

  // Calcular seleção atual
  let selectedCells: Position[] = [];
  if (isDragging && startCell && currentCell) {
    selectedCells = getLinearPath(startCell, currentCell);
  }

  useEffect(() => {
    logger.info("🎮 GameBoardLogic inicializado", {
      level,
      isMobile,
      boardSize: boardData.board.length,
      levelWordsCount: levelWords.length,
      timeLeft,
    }, "GAME_BOARD_LOGIC");
  }, [level, isMobile, boardData, levelWords, timeLeft]);

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
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,

    // Game state
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver,
  };
};
