
import React from 'react';
import { useGameBoardLogicState } from '@/hooks/useGameBoardLogicState';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
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
    handleCellMove: (row: number, col: number) => void;
    handleCellEnd: () => void;
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
  const state = useGameBoardLogicState({
    level,
    timeLeft,
    onWordFound,
    onLevelComplete,
    canRevive,
    onRevive
  });

  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    state.foundWords,
    state.levelWords,
    state.boardData,
    state.hintsUsed,
    state.setHintsUsed,
    state.setHintHighlightedCells,
    canRevive,
    () => {},
    state.setShowGameOver,
    onTimeUp
  );

  // Validação e processamento de fim de seleção
  const handleCellEnd = () => {
    const finalSelection = state.handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => state.boardData.board[pos.row][pos.col]).join('');
      
      const isValidWord = state.levelWords.includes(word);
      const isAlreadyFound = state.foundWords.some(fw => fw.word === word);

      logger.info('🔍 Tentativa de palavra', {
        word,
        level,
        isValid: isValidWord && !isAlreadyFound,
        alreadyFound: isAlreadyFound
      }, 'GAME_BOARD_LOGIC');

      if (isValidWord && !isAlreadyFound) {
        state.addFoundWord(word, finalSelection);
      }
    }
  };

  // Cores para palavras encontradas
  const getWordColor = (wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-violet-600',
      'bg-gradient-to-br from-emerald-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-amber-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-teal-600',
    ];
    return colors[wordIndex % colors.length];
  };

  const getCellWordIndex = (row: number, col: number) => {
    return state.foundWords.findIndex(fw =>
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  const currentLevelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);

  return (
    <>
      {children({
        boardData: state.boardData,
        size: state.size,
        levelWords: state.levelWords,
        foundWords: state.foundWords,
        hintsUsed: state.hintsUsed,
        selectedCells: state.selectedCells,
        isDragging: state.isDragging,
        handleCellStart: state.handleStart,
        handleCellMove: state.handleDrag,
        handleCellEnd,
        isCellSelected: state.isCellSelected,
        isCellPermanentlyMarked: state.isCellPermanentlyMarked,
        isCellHintHighlighted: state.isCellHintHighlighted,
        useHint,
        handleRevive,
        handleGoHome,
        getWordColor,
        getCellWordIndex,
        currentLevelScore,
        showGameOver: state.showGameOver,
        showLevelComplete: state.showLevelComplete,
        closeGameOver: state.closeGameOver
      })}
    </>
  );
};

export default GameBoardLogic;
