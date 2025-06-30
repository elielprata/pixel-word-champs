
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import { useSimplifiedGameLogic } from '@/hooks/useSimplifiedGameLogic';
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
  const gameLogic = useSimplifiedGameLogic({
    level,
    timeLeft,
    onLevelComplete,
    canRevive,
    onRevive,
    onStopGame
  });

  const handleReviveClick = () => {
    logger.info('💖 Revive solicitado pelo usuário', { 
      level,
      foundWords: gameLogic.foundWords.length,
      targetWords: 5
    }, 'GAME_BOARD_CONTENT');
    
    if (onRevive) {
      onRevive();
      gameLogic.closeGameOver();
    }
  };

  const handleStopGameFromModal = () => {
    logger.info('🛑 Usuário solicitou parar jogo via modal', { 
      level,
      foundWords: gameLogic.foundWords.length,
      score: gameLogic.currentLevelScore
    }, 'GAME_BOARD_CONTENT');
    
    gameLogic.handleGoHome();
  };

  if (gameLogic.isLoading || gameLogic.error) {
    return null;
  }

  logger.debug('🎮 Renderizando GameBoardContent SIMPLIFICADO', {
    level,
    timeLeft,
    foundWordsCount: gameLogic.foundWords.length,
    targetWords: 5,
    currentScore: gameLogic.currentLevelScore,
    showGameOver: gameLogic.showGameOver,
    showLevelComplete: gameLogic.showLevelComplete,
    foundWords: gameLogic.foundWords.map(fw => ({ word: fw.word, positions: fw.positions }))
  }, 'GAME_BOARD_CONTENT');

  return (
    <>
      <GameBoardHeader
        level={level}
        timeLeft={timeLeft}
        foundWords={gameLogic.foundWords}
        levelWords={gameLogic.levelWords}
        hintsUsed={gameLogic.hintsUsed}
        currentLevelScore={gameLogic.currentLevelScore}
        onUseHint={gameLogic.useHint}
      />

      <GameBoardMainContent
        boardProps={{
          boardData: gameLogic.boardData,
          size: gameLogic.size,
          selectedCells: gameLogic.selectedCells,
          isDragging: gameLogic.isSelecting
        }}
        gameStateProps={{
          foundWords: gameLogic.foundWords,
          levelWords: gameLogic.levelWords,
          currentLevelScore: gameLogic.currentLevelScore,
          hintsUsed: gameLogic.hintsUsed
        }}
        cellInteractionProps={{
          handleCellStart: gameLogic.handleCellMouseDown,
          handleCellMove: gameLogic.handleCellMouseEnter,
          handleCellEnd: gameLogic.handleCellMouseUp,
          isCellSelected: gameLogic.isCellSelected,
          isCellPermanentlyMarked: gameLogic.isCellPartOfFoundWord,
          isCellHintHighlighted: gameLogic.isCellHintHighlighted,
          getWordColor: gameLogic.getWordColor,
          getCellWordIndex: gameLogic.getCellWordIndex
        }}
      />

      <GameModals
        showGameOver={gameLogic.showGameOver}
        showLevelComplete={gameLogic.showLevelComplete}
        foundWords={gameLogic.foundWords}
        totalWords={5}
        level={level}
        canRevive={canRevive}
        onRevive={handleReviveClick}
        onGoHome={handleStopGameFromModal}
        onAdvanceLevel={onAdvanceLevel}
        onStopGame={handleStopGameFromModal}
      />
    </>
  );
};

export default GameBoardContent;
