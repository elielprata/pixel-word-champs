
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import { useGameBoard } from '@/hooks/useGameBoard';
import { logger } from '@/utils/logger';
import { GAME_CONSTANTS } from '@/constants/game';

interface GameBoardContentProps {
  level: number;
  timeLeft: number;
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
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  canRevive,
  onRevive
}: GameBoardContentProps) => {
  // Hook consolidado e simplificado
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
    onLevelComplete,
    canRevive,
    onRevive
  });

  const handleReviveClick = () => {
    logger.info('💖 Revive solicitado pelo usuário', { 
      level,
      foundWords: gameStateProps.foundWords.length,
      targetWords: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED
    }, 'GAME_BOARD_CONTENT');
    
    if (onRevive) {
      onRevive();
      gameActions.closeGameOver();
    }
  };

  const handleAdvanceLevel = () => {
    logger.info('▶️ Avançando para próximo nível', { 
      level,
      currentScore: gameStateProps.currentLevelScore 
    }, 'GAME_BOARD_CONTENT');
    gameActions.closeLevelComplete();
    onAdvanceLevel();
  };

  const handleStopGame = () => {
    logger.info('🛑 Finalizando jogo', { 
      level,
      finalScore: gameStateProps.currentLevelScore 
    }, 'GAME_BOARD_CONTENT');
    gameActions.closeLevelComplete();
    onStopGame();
  };

  if (isLoading || error) {
    return null; // Será tratado no componente pai
  }

  logger.debug('🎮 Renderizando GameBoardContent CONSOLIDADO', {
    level,
    timeLeft,
    foundWordsCount: gameStateProps.foundWords.length,
    targetWords: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED,
    currentScore: gameStateProps.currentLevelScore,
    showGameOver: modalProps.showGameOver,
    showLevelComplete: modalProps.showLevelComplete
  }, 'GAME_BOARD_CONTENT');

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
        totalWords={GAME_CONSTANTS.TOTAL_WORDS_REQUIRED}
        level={level}
        canRevive={canRevive}
        onRevive={handleReviveClick}
        onGoHome={gameActions.handleGoHome}
        onAdvanceLevel={handleAdvanceLevel}
        onStopGame={handleStopGame}
      />
    </>
  );
};

export default GameBoardContent;
