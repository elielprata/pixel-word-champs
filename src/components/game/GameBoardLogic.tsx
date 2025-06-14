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
    previewCells: Position[];
    isSelecting: boolean;
    selectionMetrics: any;
    handleCellStart: (row: number, col: number) => void;
    handleCellMoveWithValidation: (row: number, col: number) => void;
    handleCellEndWithValidation: () => void;
    isCellSelected: (row: number, col: number) => boolean;
    isCellPreviewed: (row: number, col: number) => boolean;
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
      
      // Determinar direção para métricas avançadas
      const first = finalSelection[0];
      const last = finalSelection[finalSelection.length - 1];
      const deltaRow = last.row - first.row;
      const deltaCol = last.col - first.col;
      
      let direction = 'horizontal';
      if (deltaCol === 0) direction = 'vertical';
      else if (Math.abs(deltaRow) === Math.abs(deltaCol)) direction = 'diagonal';
      
      logger.info('🔍 Tentativa de palavra com métricas', {
        word,
        level,
        isMobile,
        selectionLength: finalSelection.length,
        direction,
        isInWordList: levelWords.includes(word),
        alreadyFound: foundWords.some(fw => fw.word === word),
        validDirection: isValidWordDirection(finalSelection),
        positions: finalSelection,
        currentMetrics: selectionMetrics
      }, 'GAME_BOARD_LOGIC');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        logger.info('✅ Palavra encontrada com sucesso e métricas', { 
          word, 
          level,
          isMobile,
          direction,
          wordLength: word.length,
          selectionLength: finalSelection.length,
          positions: finalSelection,
          successMetrics: selectionMetrics
        }, 'GAME_BOARD_LOGIC');
        addFoundWord(word, finalSelection);
      } else {
        logger.warn('❌ Palavra rejeitada com contexto', {
          word,
          direction,
          reasons: {
            notInWordList: !levelWords.includes(word),
            alreadyFound: foundWords.some(fw => fw.word === word),
            invalidDirection: !isValidWordDirection(finalSelection)
          },
          failureMetrics: selectionMetrics
        }, 'GAME_BOARD_LOGIC');
      }
    } else {
      logger.debug('⚠️ Seleção muito curta', { 
        selectionLength: finalSelection.length,
        minimum: 3 
      }, 'GAME_BOARD_LOGIC');
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isInLineWithSelection, fillIntermediateCells);
  };

  // Paleta expandida de cores em formato oval como na imagem
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
    currentLevelScore,
    selectedCellsCount: selectedCells.length,
    previewCellsCount: previewCells.length,
    isSelecting,
    selectionMetrics
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
        previewCells,
        isSelecting,
        selectionMetrics,
        handleCellStart,
        handleCellMoveWithValidation,
        handleCellEndWithValidation,
        isCellSelected,
        isCellPreviewed,
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
