import React, { useEffect } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
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
    isSelecting: boolean;
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
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  const { 
    selectedCells, 
    isSelecting, 
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected 
  } = useBoardInteraction();

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
      isMobile 
    }, 'GAME_BOARD_LOGIC');
    onLevelComplete(levelScore);
  });

  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    foundWords,
    levelWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells,
    canRevive,
    () => {}, 
    setShowGameOver,
    onTimeUp
  );

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      logger.debug('🔍 Tentativa de palavra', {
        word,
        level,
        selectionLength: finalSelection.length,
        isInWordList: levelWords.includes(word),
        alreadyFound: foundWords.some(fw => fw.word === word)
      }, 'GAME_BOARD_LOGIC');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word)) {
        logger.info('✅ Palavra encontrada', { 
          word, 
          level,
          wordLength: word.length,
          selectionLength: finalSelection.length 
        }, 'GAME_BOARD_LOGIC');
        addFoundWord(word, finalSelection);
      } else {
        logger.debug('❌ Palavra rejeitada', {
          word,
          isInWordList: levelWords.includes(word),
          alreadyFound: foundWords.some(fw => fw.word === word)
        }, 'GAME_BOARD_LOGIC');
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col);
  };

  const getWordColor = (wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-violet-600',
      'bg-gradient-to-br from-emerald-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-amber-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-teal-600',
      'bg-gradient-to-br from-red-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-purple-600',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-lime-500 to-green-500',
      'bg-gradient-to-br from-fuchsia-500 to-pink-600',
      'bg-gradient-to-br from-slate-500 to-gray-600'
    ];
    return colors[wordIndex % colors.length];
  };

  const getCellWordIndex = (row: number, col: number) => {
    return foundWords.findIndex(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

  return (
    <>
      {children({
        boardData,
        size,
        levelWords,
        foundWords,
        hintsUsed,
        selectedCells,
        isSelecting,
        handleCellStart,
        handleCellMoveWithValidation,
        handleCellEndWithValidation,
        isCellSelected,
        isCellPermanentlyMarked,
        isCellHintHighlighted,
        useHint,
        handleRevive,
        handleGoHome,
        getWordColor,
        getCellWordIndex,
        currentLevelScore,
        showGameOver,
        showLevelComplete,
        closeGameOver
      })}
    </>
  );
};

export default GameBoardLogic;
