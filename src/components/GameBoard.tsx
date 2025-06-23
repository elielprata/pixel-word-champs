
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

  const gameState = useGameBoard({
    level: 1,
    timeLeft: 300,
    onLevelComplete: (score) => {
      logger.info('Nível completado', { score }, 'GAME_BOARD');
      onComplete();
    },
    canRevive: false
  });

  return (
    <GameBoardLayout>
      {/* Game content will be rendered here */}
      <div className="text-center text-white">
        <h2 className="text-xl font-bold mb-4">Challenge: {challengeId}</h2>
        <p>Game board implementation in progress...</p>
      </div>
    </GameBoardLayout>
  );
};

export default GameBoard;
