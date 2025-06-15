
import React from 'react';
import GameBoardLayout from './game/GameBoardLayout';
import GameBoardContent from './game/GameBoardContent';
import GameBoardLoadingState from './game/GameBoardLoadingState';
import GameBoardErrorState from './game/GameBoardErrorState';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
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
  logger.debug('Renderizando GameBoard simplificado', { 
    level, 
    timeLeft, 
    canRevive 
  }, 'GAME_BOARD');

  const { isLoading, error, isWordSelectionError } = useOptimizedBoard(level);

  if (isLoading) {
    return (
      <GameBoardLayout>
        <GameBoardLoadingState 
          level={level} 
          debugInfo="Carregando palavras..." 
        />
      </GameBoardLayout>
    );
  }

  if (error) {
    return (
      <GameBoardLayout>
        <GameBoardErrorState 
          error={error} 
          debugInfo={isWordSelectionError ? "Erro na seleção de palavras" : "Erro na geração do tabuleiro"}
          level={level}
          isWordSelectionError={isWordSelectionError}
          onRetry={() => window.location.reload()}
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
