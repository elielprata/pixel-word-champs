
import React from 'react';
import GameBoardLayout from './game/GameBoardLayout';
import GameBoardContent from './game/GameBoardContent';
import GameBoardLoadingState from './game/GameBoardLoadingState';
import GameBoardErrorState from './game/GameBoardErrorState';
import { useSimpleGameBoard } from '@/hooks/useSimpleGameBoard';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  canRevive?: boolean;
  onRevive?: () => void;
}

const GameBoard = ({ 
  level, 
  timeLeft, 
  onWordFound, 
  onTimeUp, 
  onLevelComplete, 
  onAdvanceLevel, 
  onStopGame,
  canRevive = true,
  onRevive
}: GameBoardProps) => {
  logger.debug('🎮 GameBoard simplificado', { level, timeLeft }, 'GAME_BOARD');

  const gameBoard = useSimpleGameBoard({
    level,
    timeLeft,
    onWordFound,
    onLevelComplete
  });

  if (gameBoard.isLoading) {
    return (
      <GameBoardLayout>
        <GameBoardLoadingState 
          level={level} 
          debugInfo="Carregando jogo simplificado..." 
        />
      </GameBoardLayout>
    );
  }

  if (gameBoard.error) {
    return (
      <GameBoardLayout>
        <GameBoardErrorState 
          error={gameBoard.error} 
          debugInfo="Erro no sistema simplificado"
        />
      </GameBoardLayout>
    );
  }

  return (
    <GameBoardLayout>
      <GameBoardContent
        level={level}
        timeLeft={timeLeft}
        onWordFound={onWordFound}
        onTimeUp={onTimeUp}
        onLevelComplete={onLevelComplete}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
        canRevive={canRevive}
        onRevive={onRevive}
      />
    </GameBoardLayout>
  );
};

export default GameBoard;
