
import React from 'react';
import GameOverModal from './GameOverModal';
import LevelCompleteModal from './LevelCompleteModal';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface GameModalsProps {
  showGameOver: boolean;
  showLevelComplete: boolean;
  foundWords: FoundWord[];
  level: number;
  canRevive: boolean;
  onRevive: () => void;
  onGoHome: () => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
}

const GameModals = ({
  showGameOver,
  showLevelComplete,
  foundWords,
  level,
  canRevive,
  onRevive,
  onGoHome,
  onAdvanceLevel,
  onStopGame
}: GameModalsProps) => {
  const totalScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

  logger.debug('Renderizando GameModals', { 
    showGameOver, 
    showLevelComplete, 
    totalScore, 
    level,
    canRevive,
    foundWordsCount: foundWords.length
  }, 'GAME_MODALS');

  const handleAdvanceLevelClick = () => {
    logger.info('Usuário avançando para próximo nível', { 
      currentLevel: level, 
      totalScore 
    }, 'GAME_MODALS');
    onAdvanceLevel();
  };

  const handleStayLevel = () => {
    logger.info('Usuário escolheu parar no nível atual', { 
      level, 
      totalScore 
    }, 'GAME_MODALS');
    onStopGame();
  };

  const handleGameOverStop = () => {
    logger.info('Usuário escolheu parar após Game Over', { 
      level, 
      totalScore 
    }, 'GAME_MODALS');
    onStopGame();
  };

  const handleRevive = () => {
    logger.info('Usuário solicitou revive', { 
      level, 
      canRevive 
    }, 'GAME_MODALS');
    onRevive();
  };

  return (
    <>
      <GameOverModal
        isOpen={showGameOver}
        score={totalScore}
        wordsFound={foundWords.length}
        totalWords={5}
        onRevive={handleRevive}
        onGoHome={handleGameOverStop}
        canRevive={canRevive}
      />

      <LevelCompleteModal
        isOpen={showLevelComplete}
        level={level}
        score={totalScore}
        onAdvance={handleAdvanceLevelClick}
        onStay={handleStayLevel}
      />
    </>
  );
};

export default GameModals;
