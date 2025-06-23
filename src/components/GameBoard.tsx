
import React from 'react';
import GameBoardLayout from './game/GameBoardLayout';
import { useGameBoard } from '@/hooks/useGameBoard';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  challengeId: string;
  onBack: () => void;
  onComplete: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ challengeId, onBack, onComplete }) => {
  logger.debug('GameBoard renderizado', { challengeId }, 'GAME_BOARD');

  const gameState = useGameBoard(challengeId);

  return (
    <GameBoardLayout
      gameState={gameState}
      onBack={onBack}
      onComplete={onComplete}
    />
  );
};

export default GameBoard;
