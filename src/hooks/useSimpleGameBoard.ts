
import { useCallback, useEffect } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useSimpleSelection } from './useSimpleSelection';
import { useGameState } from './useGameState';
import { useGameValidation } from './useGameValidation';
import { useGameScore } from './useGameScore';
import { logger } from '@/utils/logger';
import { isLinearPath } from './word-selection/validateLinearPath';

interface SimpleGameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
}

export const useSimpleGameBoard = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete
}: SimpleGameBoardProps) => {
  const { boardData, size, width, levelWords, isLoading, error } = useOptimizedBoard(level);
  
  // Estados do jogo
  const gameState = useGameState(level, timeLeft);
  const { currentLevelScore, updateUserScore } = useGameScore(gameState.foundWords);
  const { validateAndAddWord } = useGameValidation(gameState.foundWords, levelWords, onWordFound);

  // Seleção de células
  const {
    startCell,
    currentCell,
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,
    getLinearPath
  } = useSimpleSelection();

  // Verificar conclusão do nível
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

  // Finalizar seleção
  const handleCellEnd = useCallback(() => {
    const selection = handleEnd();

    if (selection.length >= 3 && isLinearPath(selection)) {
      const word = selection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      const validatedWord = validateAndAddWord(word, selection);
      if (validatedWord) {
        gameState.addFoundWord(validatedWord);
      }
    }
  }, [handleEnd, boardData.board, validateAndAddWord, gameState]);

  // Seleção atual
  const selectedCells = isDragging && startCell && currentCell 
    ? getLinearPath(startCell, currentCell) 
    : [];

  return {
    // Dados do tabuleiro
    boardData,
    size,
    width,
    levelWords,
    isLoading,
    error,

    // Estado do jogo
    foundWords: gameState.foundWords,
    currentLevelScore,
    showLevelComplete: gameState.showLevelComplete,
    showGameOver: gameState.showGameOver,

    // Interações
    selectedCells,
    isDragging,
    handleStart,
    handleDrag,
    handleCellEnd,
    isCellSelected,

    // Ações do jogo
    gameState
  };
};
