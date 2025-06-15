
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
  const {
    isLoading,
    error,
    boardProps,
    gameStateProps,
    modalProps,
    cellInteractionProps,
    gameActions
  } = useGameBoard({
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
      gameActions.closeGameOver();
    }
  };

  if (isLoading || error) {
    return null; // Será tratado no componente pai
  }

  return (
    <>
      <GameBoardHeader
        level={level}
        timeLeft={timeLeft}
        foundWords={gameStateProps.foundWords}
        levelWords={gameStateProps.levelWords}
        hintsUsed={gameStateProps.hintsUsed}
        currentLevelScore={gameStateProps.currentLevelScore}
        onUseHint={gameActions.useHint}
      />

      <GameBoardMainContent
        boardProps={boardProps}
        gameStateProps={gameStateProps}
        cellInteractionProps={cellInteractionProps}
      />

      <GameModals
        showGameOver={modalProps.showGameOver}
        showLevelComplete={modalProps.showLevelComplete}
        foundWords={gameStateProps.foundWords}
        totalWords={gameStateProps.levelWords.length}
        level={level}
        canRevive={canRevive}
        onRevive={handleReviveClick}
        onGoHome={gameActions.handleGoHome}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
      />
    </>
  );
};

export default GameBoardContent;
