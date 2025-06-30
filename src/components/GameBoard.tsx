
import React, { useState, useEffect, useCallback } from 'react';
import { useIntegratedGameTimer } from '@/hooks/useIntegratedGameTimer';
import GameBoardErrorState from './game/GameBoardErrorState';
import GameBoardLoadingState from './game/GameBoardLoadingState';
import SimpleGameBoardContent from './game/SimpleGameBoardContent';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  level: number;
  timeLeft?: number;
  onTimeUp?: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel?: () => void;
  onStopGame?: () => void;
  canRevive?: boolean;
  onRevive?: () => void;
}

const GameBoard = ({
  level,
  timeLeft: externalTimeLeft,
  onTimeUp: externalOnTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  canRevive = false,
  onRevive
}: GameBoardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer integrado para controle do tempo
  const {
    timeLeft: internalTimeLeft,
    onTimeUp: internalOnTimeUp,
    startTimer,
    stopTimer,
    resetTimer
  } = useIntegratedGameTimer({
    initialTime: 300, // 5 minutos
    onTimeUp: externalOnTimeUp
  });

  // Usar tempo externo se fornecido, senão usar interno
  const timeLeft = externalTimeLeft !== undefined ? externalTimeLeft : internalTimeLeft;
  const onTimeUp = externalOnTimeUp || internalOnTimeUp;

  // Inicializar o jogo
  useEffect(() => {
    logger.info('🎮 Inicializando GameBoard', { 
      level, 
      hasExternalTimeLeft: externalTimeLeft !== undefined 
    }, 'GAME_BOARD');

    setIsLoading(true);
    setError(null);

    // Simular carregamento mínimo
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      if (externalTimeLeft === undefined) {
        startTimer();
      }
    }, 500);

    return () => {
      clearTimeout(loadingTimer);
      if (externalTimeLeft === undefined) {
        stopTimer();
      }
    };
  }, [level, externalTimeLeft, startTimer, stopTimer]);

  // Limpar timer quando componente for desmontado
  useEffect(() => {
    return () => {
      if (externalTimeLeft === undefined) {
        stopTimer();
      }
    };
  }, [externalTimeLeft, stopTimer]);

  const handleLevelComplete = useCallback((levelScore: number) => {
    logger.info('🏆 Nível completado no GameBoard', { 
      level, 
      levelScore 
    }, 'GAME_BOARD');
    
    if (externalTimeLeft === undefined) {
      stopTimer();
    }
    onLevelComplete(levelScore);
  }, [level, onLevelComplete, stopTimer, externalTimeLeft]);

  const handleStopGame = useCallback(() => {
    logger.info('🛑 Parando jogo', { level }, 'GAME_BOARD');
    
    if (externalTimeLeft === undefined) {
      stopTimer();
    }
    if (onStopGame) {
      onStopGame();
    }
  }, [level, onStopGame, stopTimer, externalTimeLeft]);

  const handleRevive = useCallback(() => {
    logger.info('💖 Revive ativado', { level }, 'GAME_BOARD');
    
    if (externalTimeLeft === undefined) {
      resetTimer();
      startTimer();
    }
    if (onRevive) {
      onRevive();
    }
  }, [level, onRevive, resetTimer, startTimer, externalTimeLeft]);

  if (isLoading) {
    return <GameBoardLoadingState />;
  }

  if (error) {
    return <GameBoardErrorState error={error} />;
  }

  return (
    <div className="game-board-container">
      <SimpleGameBoardContent
        level={level}
        timeLeft={timeLeft}
        onTimeUp={onTimeUp}
        onLevelComplete={handleLevelComplete}
        onAdvanceLevel={onAdvanceLevel || (() => {})}
        onStopGame={handleStopGame}
        canRevive={canRevive}
        onRevive={handleRevive}
      />
    </div>
  );
};

export default GameBoard;
