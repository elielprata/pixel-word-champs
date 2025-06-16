
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import GameBackButton from './GameBackButton';
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

  if (isLoading || error) {
    return null; // Será tratado no componente pai
  }

  logger.debug('🎮 Renderizando GameBoardContent SIMPLIFICADO', {
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
      {/* Botão voltar com posicionamento fixo e z-index alto */}
      <GameBackButton onBack={onStopGame} />

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
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={onStopGame}
      />
    </>
  );
};

export default GameBoardContent;
