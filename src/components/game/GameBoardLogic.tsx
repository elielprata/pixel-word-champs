
import React from 'react';
import { useGameBoardLogicState } from '@/hooks/useGameBoardLogicState';
import { useGameBoardActions } from '@/hooks/useGameBoardActions';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardLogicProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
  children: (logicProps: {
    boardData: { board: string[][]; placedWords: any[] };
    size: number;
    levelWords: string[];
    foundWords: FoundWord[];
    hintsUsed: number;
    selectedCells: Position[];
    isDragging: boolean;
    handleCellStart: (row: number, col: number) => void;
    handleCellMoveWithValidation: (row: number, col: number) => void;
    handleCellEndWithValidation: () => void;
    isCellSelected: (row: number, col: number) => boolean;
    isCellPermanentlyMarked: (row: number, col: number) => boolean;
    isCellHintHighlighted: (row: number, col: number) => boolean;
    useHint: () => void;
    handleRevive: () => void;
    handleGoHome: () => void;
    getWordColor: (wordIndex: number) => string;
    getCellWordIndex: (row: number, col: number) => number;
    currentLevelScore: number;
    showGameOver: boolean;
    showLevelComplete: boolean;
    closeGameOver: () => void;
  }) => React.ReactNode;
}

const GameBoardLogic = ({
  level,
  timeLeft,
  onWordFound,
  onTimeUp,
  onLevelComplete,
  canRevive,
  onRevive,
  children
}: GameBoardLogicProps) => {
  // Use the state management hook
  const state = useGameBoardLogicState({
    level,
    timeLeft,
    onWordFound,
    onLevelComplete,
    canRevive,
    onRevive
  });

  // Use the actions hook
  const actions = useGameBoardActions({
    foundWords: state.foundWords,
    levelWords: state.levelWords,
    boardData: state.boardData,
    hintsUsed: state.hintsUsed,
    level,
    isMobile: state.isMobile,
    canRevive,
    onTimeUp,
    setHintsUsed: state.setHintsUsed,
    setHintHighlightedCells: state.setHintHighlightedCells,
    setShowGameOver: state.setShowGameOver,
    handleCellEnd: state.handleEnd,
    handleCellMove: state.handleDrag,
    addFoundWord: state.addFoundWord
  });

  // Novo: cálculo dinâmico da seleção real
  let selectedCells: Position[] = [];
  if (state.isDragging && state.startCell && state.currentCell) {
    selectedCells = state.getLinearPath(state.startCell, state.currentCell);
  }

  // Calcular pontuação atual do nível (palavras encontradas)
  const currentLevelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);

  // Log final antes de retornar
  logger.debug('🎯 GameBoardLogic props finais', {
    level,
    isMobile: state.isMobile,
    boardDataReady: state.boardData.board.length > 0,
    levelWordsCount: state.levelWords.length,
    foundWordsCount: state.foundWords.length,
    currentLevelScore,
    selectedCellsCount: selectedCells.length,
    isDragging: state.isDragging
  }, 'GAME_BOARD_LOGIC');

  return (
    <>
      {children({
        boardData: state.boardData,
        size: state.size,
        levelWords: state.levelWords,
        foundWords: state.foundWords,
        hintsUsed: state.hintsUsed,
        selectedCells,
        isDragging: state.isDragging,
        handleCellStart: state.handleStart,
        handleCellMoveWithValidation: actions.handleCellMoveWithValidation,
        handleCellEndWithValidation: actions.handleCellEndWithValidation,
        isCellSelected: state.isCellSelected,
        isCellPermanentlyMarked: state.isCellPermanentlyMarked,
        isCellHintHighlighted: state.isCellHintHighlighted,
        useHint: actions.useHint,
        handleRevive: actions.handleRevive,
        handleGoHome: actions.handleGoHome,
        getWordColor: actions.getWordColor,
        getCellWordIndex: actions.getCellWordIndex,
        currentLevelScore,
        showGameOver: state.showGameOver,
        showLevelComplete: state.showLevelComplete,
        closeGameOver: state.closeGameOver
      })}
    </>
  );
};

export default GameBoardLogic;
