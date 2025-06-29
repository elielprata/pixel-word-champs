
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
  totalWords: number; // Este prop será ignorado, sempre usaremos 5
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
  totalWords, // Ignorado, sempre usamos 5
  level,
  canRevive,
  onRevive,
  onGoHome,
  onAdvanceLevel,
  onStopGame
}: GameModalsProps) => {
  // ETAPA 2: Sempre usar 5 como total de palavras
  const TOTAL_WORDS = 5;
  const totalScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

  logger.debug('🎭 Renderizando GameModals', { 
    showGameOver, 
    showLevelComplete, 
    totalScore, 
    level,
    foundWordsCount: foundWords.length,
    totalWords: TOTAL_WORDS, // Log com valor fixo
    foundWords: foundWords.map(fw => fw.word)
  }, 'GAME_MODALS');

  const handleAdvanceLevelClick = () => {
    logger.info('▶️ Avançando para próximo nível', { 
      level,
      currentScore: totalScore 
    }, 'GAME_MODALS');
    onAdvanceLevel();
  };

  const handleStayLevel = () => {
    logger.info('🛑 Usuário escolheu parar no nível', { 
      level,
      finalScore: totalScore 
    }, 'GAME_MODALS');
    onStopGame();
  };

  const handleGameOverStop = () => {
    logger.info('🛑 Usuário escolheu parar do Game Over', { 
      level,
      finalScore: totalScore 
    }, 'GAME_MODALS');
    onStopGame();
  };

  const handleRevive = () => {
    logger.info('💖 Usuário solicitou revive', { 
      level,
      currentScore: totalScore 
    }, 'GAME_MODALS');
    onRevive();
  };

  // Log específico quando modal de nível completo deveria aparecer
  if (showLevelComplete) {
    logger.info('🏆 Modal de nível completado deve estar visível', {
      level,
      totalScore,
      foundWordsCount: foundWords.length,
      totalWords: TOTAL_WORDS
    }, 'GAME_MODALS');
  }

  return (
    <>
      <GameOverModal
        isOpen={showGameOver}
        score={totalScore}
        wordsFound={foundWords.length}
        totalWords={TOTAL_WORDS}
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
