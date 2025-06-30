
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import { useSimpleGameBoard } from '@/hooks/useSimpleGameBoard';
import { logger } from '@/utils/logger';

interface SimpleGameBoardContentProps {
  level: number;
  timeLeft: number;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  canRevive: boolean;
  onRevive?: () => void;
}

const SimpleGameBoardContent = ({
  level,
  timeLeft,
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  canRevive,
  onRevive
}: SimpleGameBoardContentProps) => {
  
  const gameBoard = useSimpleGameBoard({
    level,
    timeLeft,
    onLevelComplete,
    canRevive,
    onRevive
  });

  const handleReviveClick = () => {
    logger.info('💖 Revive solicitado', { level }, 'SIMPLE_GAME_BOARD_CONTENT');
    
    if (onRevive) {
      onRevive();
      gameBoard.closeGameOver();
    }
  };

  if (gameBoard.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (gameBoard.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar o jogo: {gameBoard.error}</p>
        </div>
      </div>
    );
  }

  logger.debug('🎮 Renderizando SimpleGameBoardContent', {
    level,
    timeLeft,
    foundWordsCount: gameBoard.foundWords.length,
    currentScore: gameBoard.currentScore,
    showGameOver: gameBoard.showGameOver,
    showLevelComplete: gameBoard.showLevelComplete
  }, 'SIMPLE_GAME_BOARD_CONTENT');

  return (
    <>
      <GameBoardHeader
        level={level}
        timeLeft={timeLeft}
        foundWords={gameBoard.foundWords}
        levelWords={gameBoard.levelWords}
        hintsUsed={gameBoard.hintsUsed}
        currentLevelScore={gameBoard.currentScore}
        onUseHint={gameBoard.useHint}
      />

      <GameBoardMainContent
        boardProps={{
          boardData: gameBoard.boardData,
          size: gameBoard.size,
          selectedCells: gameBoard.selectedCells,
          isDragging: gameBoard.isDragging
        }}
        gameStateProps={{
          foundWords: gameBoard.foundWords,
          levelWords: gameBoard.levelWords,
          hintsUsed: gameBoard.hintsUsed,
          currentLevelScore: gameBoard.currentScore
        }}
        cellInteractionProps={{
          handleCellStart: gameBoard.handleCellStart,
          handleCellMove: gameBoard.handleCellMove,
          handleCellEnd: gameBoard.handleCellEnd,
          isCellSelected: gameBoard.isCellSelected,
          isCellPermanentlyMarked: gameBoard.isCellPermanentlyMarked,
          isCellHintHighlighted: gameBoard.isCellHintHighlighted,
          getCellWordIndex: gameBoard.getCellWordIndex,
          getWordColor: gameBoard.getWordColor
        }}
      />

      <GameModals
        showGameOver={gameBoard.showGameOver}
        showLevelComplete={gameBoard.showLevelComplete}
        foundWords={gameBoard.foundWords}
        totalWords={15}
        level={level}
        canRevive={canRevive}
        onRevive={handleReviveClick}
        onGoHome={gameBoard.handleGoHome}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
      />
    </>
  );
};

export default SimpleGameBoardContent;
