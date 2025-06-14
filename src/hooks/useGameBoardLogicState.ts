
import { useEffect } from "react";
import { useOptimizedBoard } from "@/hooks/useOptimizedBoard";
import { useSimpleSelection } from "@/hooks/useSimpleSelection";
import { useGameLogic } from "@/hooks/useGameLogic";
import { useIsMobile } from "@/hooks/use-mobile";
import { logger } from "@/utils/logger";
import { type Position } from "@/utils/boardUtils";

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

  useEffect(() => {
    logger.info("🎮 GameBoardLogic renderizado", {
      level,
      isMobile,
      isLoading,
      hasError: !!error,
      boardSize: boardData.board.length,
      levelWordsCount: levelWords.length,
      placedWordsCount: boardData.placedWords.length,
      timeLeft,
    }, "GAME_BOARD_LOGIC");
  }, [level, isMobile, isLoading, error, boardData, levelWords, timeLeft]);

  useEffect(() => {
    if (boardData.board.length > 0) {
      logger.info("📋 Dados do tabuleiro recebidos", {
        level,
        isMobile,
        boardSize: boardData.board.length,
        levelWords,
        placedWords: boardData.placedWords.map((pw) => pw.word),
        boardPreview: boardData.board.slice(0, 2).map((row) => row.join("")),
      }, "GAME_BOARD_LOGIC");
    }
  }, [boardData, levelWords, level, isMobile]);

  // NOVO: Usa ultra-simples
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
    isLevelCompleted,
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver,
  } = useGameLogic(level, timeLeft, levelWords, onWordFound, (levelScore) => {
    logger.info("🎉 Nível completado", {
      level,
      levelScore,
      foundWordsCount: foundWords.length,
      isMobile,
    }, "GAME_BOARD_LOGIC");
    onLevelComplete(levelScore);
  });

  return {
    boardData,
    size,
    levelWords,
    isLoading,
    error,
    isMobile,

    // Ultra-simples:
    startCell,
    currentCell,
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,
    getLinearPath,

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
    closeGameOver,
  };
};
