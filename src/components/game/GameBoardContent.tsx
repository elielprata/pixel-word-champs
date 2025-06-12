
import React from 'react';
import GameBoardGrid from './GameBoardGrid';
import WordsList from './WordsList';
import GameModals from './GameModals';
import { useBoard } from '@/hooks/useBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
import { useWordValidation } from '@/hooks/useWordValidation';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardContentProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  canRevive: boolean;
  onRevive?: () => void;
}

const GameBoardContent = ({
  level,
  timeLeft,
  onWordFound,
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  canRevive,
  onRevive
}: GameBoardContentProps) => {
  const { boardData, size, levelWords } = useBoard(level);
  
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
    logger.info('Nível completado', { 
      level, 
      levelScore,
      foundWordsCount: foundWords.length 
    }, 'GAME_BOARD_CONTENT');
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
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        logger.info('Palavra encontrada', { 
          word, 
          level,
          wordLength: word.length,
          selectionLength: finalSelection.length 
        }, 'GAME_BOARD_CONTENT');
        addFoundWord(word, finalSelection);
      } else {
        logger.debug('Palavra inválida tentada', { 
          word,
          level,
          isInWordList: levelWords.includes(word),
          alreadyFound: foundWords.some(fw => fw.word === word),
          validDirection: isValidWordDirection(finalSelection)
        }, 'GAME_BOARD_CONTENT');
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isValidWordDirection);
  };

  const handleReviveClick = () => {
    if (onRevive) {
      logger.info('Revive ativado', { 
        level,
        timeLeft,
        foundWordsCount: foundWords.length 
      }, 'GAME_BOARD_CONTENT');
      onRevive();
      closeGameOver();
    }
  };

  const handleUseHintClick = () => {
    logger.info('Dica utilizada', { 
      level,
      hintsUsed: hintsUsed + 1,
      timeLeft 
    }, 'GAME_BOARD_CONTENT');
    useHint();
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

  return (
    <>
      {/* Tabuleiro principal */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
        <GameBoardGrid
          boardData={boardData}
          size={size}
          selectedCells={selectedCells}
          isSelecting={isSelecting}
          isCellSelected={isCellSelected}
          isCellPermanentlyMarked={isCellPermanentlyMarked}
          isCellHintHighlighted={isCellHintHighlighted}
          handleCellStart={handleCellStart}
          handleCellMove={handleCellMoveWithValidation}
          handleCellEndWithValidation={handleCellEndWithValidation}
          getWordColor={getWordColor}
          getCellWordIndex={getCellWordIndex}
        />
      </div>

      {/* Lista de palavras */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <WordsList 
          levelWords={levelWords}
          foundWords={foundWords}
          getWordColor={getWordColor}
        />
      </div>

      <GameModals
        showGameOver={showGameOver}
        showLevelComplete={showLevelComplete}
        foundWords={foundWords}
        level={level}
        canRevive={canRevive}
        onRevive={handleReviveClick}
        onGoHome={handleGoHome}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
      />

      {/* Export data for parent component */}
      <div style={{ display: 'none' }}>
        {/* This is a hacky way to pass data up, but it works for the refactor */}
        <span data-found-words={foundWords.length} />
        <span data-level-words={levelWords.length} />
        <span data-hints-used={hintsUsed} />
        <span data-current-score={currentLevelScore} />
        <span data-use-hint-handler={handleUseHintClick.toString()} />
      </div>
    </>
  );
};

export default GameBoardContent;
