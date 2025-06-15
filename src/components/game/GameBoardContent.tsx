
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import { useGameBoard } from '@/hooks/useGameBoard';

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
  const gameBoard = useGameBoard({
    level,
    timeLeft,
    onWordFound,
    onLevelComplete,
    canRevive,
    onRevive
  });

  const handleReviveClick = () => {
    if (onRevive) {
      onRevive();
      gameBoard.closeGameOver();
    }
  };

  if (gameBoard.isLoading || gameBoard.error) {
    return null; // Será tratado no componente pai
  }

  return (
    <>
      <GameBoardHeader
        level={level}
        timeLeft={timeLeft}
        foundWords={gameBoard.foundWords}
        levelWords={gameBoard.levelWords}
        hintsUsed={gameBoard.hintsUsed}
        currentLevelScore={gameBoard.currentLevelScore}
        onUseHint={gameBoard.useHint}
      />

      <GameBoardMainContent
        boardData={gameBoard.boardData}
        size={gameBoard.size}
        selectedCells={gameBoard.selectedCells}
        isDragging={gameBoard.isDragging}
        foundWords={gameBoard.foundWords}
        levelWords={gameBoard.levelWords}
        isCellSelected={gameBoard.isCellSelected}
        isCellPermanentlyMarked={gameBoard.isCellPermanentlyMarked}
        isCellHintHighlighted={gameBoard.isCellHintHighlighted}
        handleCellStart={gameBoard.handleCellStart}
        handleCellMoveWithValidation={gameBoard.handleCellMove}
        handleCellEndWithValidation={gameBoard.handleCellEnd}
        getWordColor={gameBoard.getWordColor}
        getCellWordIndex={gameBoard.getCellWordIndex}
      />

      <GameModals
        showGameOver={gameBoard.showGameOver}
        showLevelComplete={gameBoard.showLevelComplete}
        foundWords={gameBoard.foundWords}
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

export default GameBoardContent;
