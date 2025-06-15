
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import { useGameBoard } from '@/hooks/useGameBoard';
import { logger } from '@/utils/logger';

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
  // CORREÇÃO DEFINITIVA: Hook consolidado sem callback onWordFound
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
      targetWords: 5 // ETAPA 4: Sempre 5 palavras como objetivo
    }, 'GAME_BOARD_CONTENT');
    
    if (onRevive) {
      onRevive();
      gameActions.closeGameOver();
    }
  };

  if (isLoading || error) {
    return null; // Será tratado no componente pai
  }

  // CORREÇÃO DEFINITIVA: Log do estado do jogo
  logger.debug('🎮 Renderizando GameBoardContent (SEM CALLBACK onWordFound)', {
    level,
    timeLeft,
    foundWordsCount: gameStateProps.foundWords.length,
    targetWords: 5, // Sempre 5 palavras
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
        totalWords={5} // ETAPA 4: Sempre passar 5 como total de palavras
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
