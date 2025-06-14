
import React, { useEffect } from 'react';
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
    isSelecting, 
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected 
  } = useBoardInteraction();
  
  const { isValidWordDirection } = useWordValidation();

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
        isMobile,
        selectionLength: finalSelection.length,
        isInWordList: levelWords.includes(word),
        alreadyFound: foundWords.some(fw => fw.word === word),
        validDirection: isValidWordDirection(finalSelection)
      }, 'GAME_BOARD_LOGIC');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        logger.info('✅ Palavra encontrada', { 
          word, 
          level,
          isMobile,
          wordLength: word.length,
          selectionLength: finalSelection.length 
        }, 'GAME_BOARD_LOGIC');
        addFoundWord(word, finalSelection);
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isValidWordDirection);
  };

  // Função para obter a cor específica de uma palavra encontrada
  const getWordColor = (wordIndex: number) => {
    const colors = [
      'from-emerald-400 to-green-500',
      'from-blue-400 to-indigo-500', 
      'from-purple-400 to-violet-500',
      'from-pink-400 to-rose-500',
      'from-orange-400 to-amber-500',
      'from-cyan-400 to-teal-500',
      'from-red-400 to-pink-500',
      'from-lime-400 to-green-500'
    ];
    return colors[wordIndex % colors.length];
  };

  // Função para verificar se uma célula pertence a uma palavra específica
  const getCellWordIndex = (row: number, col: number) => {
    return foundWords.findIndex(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  // Calcular pontuação atual do nível (palavras encontradas)
  const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

  // Log final antes de retornar
  logger.debug('🎯 GameBoardLogic otimizado props finais', {
    level,
    isMobile,
    boardDataReady: boardData.board.length > 0,
    levelWordsCount: levelWords.length,
    foundWordsCount: foundWords.length,
    currentLevelScore
  }, 'GAME_BOARD_LOGIC');

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
