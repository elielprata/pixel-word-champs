
import { useEffect } from 'react';
import { useGameState } from './useGameState';
import { useGameScore } from './useGameScore';
import { logger } from '@/utils/logger';

interface UseGameBoardStateProps {
  level: number;
  timeLeft: number;
  levelWords: string[];
  onLevelComplete: (levelScore: number) => void;
}

export const useGameBoardState = ({
  level,
  timeLeft,
  levelWords,
  onLevelComplete
}: UseGameBoardStateProps) => {
  const gameState = useGameState(level, timeLeft);
  const { currentLevelScore, updateUserScore } = useGameScore(gameState.foundWords);

  // Check level completion
  useEffect(() => {
    if (gameState.foundWords.length === levelWords.length && 
        levelWords.length > 0 && 
        !gameState.showLevelComplete) {
      
      logger.info(`✅ Nível ${level} concluído com pontuação ${currentLevelScore}`);
      
      gameState.setShowLevelComplete(true);
      updateUserScore(currentLevelScore);
      onLevelComplete(currentLevelScore);
    }
  }, [gameState.foundWords.length, levelWords.length, gameState.showLevelComplete, 
      level, onLevelComplete, currentLevelScore, updateUserScore]);

  return {
    gameState,
    currentLevelScore
  };
};
