
import { useCallback } from 'react';
import { GAME_CONSTANTS } from '@/constants/game';
import { logger } from '@/utils/logger';

interface GameActionsProps {
  gameState: any;
  levelWords: string[];
  boardData: { placedWords: any[] };
}

export const useGameActions = ({
  gameState,
  levelWords,
  boardData
}: GameActionsProps) => {
  const useHint = useCallback(() => {
    if (gameState.gameState.hintsUsed >= GAME_CONSTANTS.MAX_HINTS_PER_LEVEL) {
      logger.warn('⚠️ Limite de dicas atingido', { 
        used: gameState.gameState.hintsUsed, 
        max: GAME_CONSTANTS.MAX_HINTS_PER_LEVEL 
      }, 'GAME_ACTIONS');
      return;
    }

    const remainingWords = levelWords.filter(word => 
      !gameState.gameState.foundWords.some(fw => fw.word === word)
    );

    if (remainingWords.length === 0) {
      logger.warn('⚠️ Não há palavras restantes para dica', {}, 'GAME_ACTIONS');
      return;
    }

    const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    const placedWord = boardData.placedWords.find(pw => pw.word === randomWord);
    
    if (placedWord) {
      gameState.updateGameState({ hintHighlightedCells: placedWord.positions });
      gameState.updateGameState({ hintsUsed: gameState.gameState.hintsUsed + 1 });
      
      logger.info(`💡 Dica usada para palavra "${randomWord}"`, { 
        word: randomWord,
        hintsUsed: gameState.gameState.hintsUsed + 1 
      }, 'GAME_ACTIONS');

      setTimeout(() => {
        gameState.updateGameState({ hintHighlightedCells: [] });
      }, 3000);
    }
  }, [gameState, levelWords, boardData.placedWords]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const closeGameOver = useCallback(() => {
    gameState.updateGameState({ showGameOver: false });
  }, [gameState]);

  return {
    useHint,
    handleGoHome,
    closeGameOver
  };
};
