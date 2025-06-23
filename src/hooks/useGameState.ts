
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGameScoring } from '@/hooks/useGameScoring';
import { logger } from '@/utils/logger';
import { GAME_CONSTANTS } from '@/constants/game';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameState {
  foundWords: FoundWord[];
  hintsUsed: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
  isLevelCompleted: boolean;
}

export const useGameState = (
  level: number, 
  timeLeft: number,
  onLevelComplete?: (levelScore: number) => void
) => {
  const [state, setState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    showGameOver: false,
    showLevelComplete: false,
    hintHighlightedCells: [],
    permanentlyMarkedCells: [],
    isLevelCompleted: false
  });

  // Usar hook especializado de pontuação
  const { 
    currentLevelScore, 
    isLevelCompleted, 
    updateUserScore 
  } = useGameScoring(state.foundWords, level);

  // Reset state quando muda o nível
  useEffect(() => {
    logger.info(`🔄 Resetando estado do jogo para nível ${level}`, { level }, 'GAME_STATE');
    setState({
      foundWords: [],
      hintsUsed: 0,
      showGameOver: false,
      showLevelComplete: false,
      hintHighlightedCells: [],
      permanentlyMarkedCells: [],
      isLevelCompleted: false
    });
  }, [level]);

  // Game Over quando tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver && !state.isLevelCompleted) {
      logger.info('⏰ Tempo esgotado - Game Over', { 
        level, 
        foundWords: state.foundWords.length,
        targetWords: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED 
      }, 'GAME_STATE');
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver, state.isLevelCompleted, level, state.foundWords.length]);

  // Level complete quando atinge o número necessário de palavras
  useEffect(() => {
    if (isLevelCompleted && !state.showLevelComplete && !state.isLevelCompleted) {
      logger.info(`🎉 Nível ${level} COMPLETADO!`, {
        level,
        foundWordsCount: state.foundWords.length,
        totalWordsRequired: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED,
        foundWords: state.foundWords.map(fw => fw.word),
        levelScore: currentLevelScore
      }, 'GAME_STATE');
      
      setState(prev => ({ 
        ...prev, 
        showLevelComplete: true, 
        isLevelCompleted: true 
      }));
      
      // Notificar level complete via callback
      if (onLevelComplete) {
        logger.info(`📞 CALLBACK - Notificando level complete: ${currentLevelScore} pontos`, {
          level,
          score: currentLevelScore
        }, 'GAME_STATE');
        onLevelComplete(currentLevelScore);
      }
      
      // Registrar pontos no banco
      updateUserScore(currentLevelScore);
    }
  }, [isLevelCompleted, state.showLevelComplete, state.isLevelCompleted, state.foundWords, level, currentLevelScore, updateUserScore, onLevelComplete]);

  const addFoundWord = (newFoundWord: FoundWord) => {
    // PROTEÇÃO FINAL: Verificar duplicação uma última vez antes de adicionar ao estado
    const isAlreadyFound = state.foundWords.some(fw => fw.word === newFoundWord.word);
    if (isAlreadyFound) {
      logger.error(`🚨 DUPLICAÇÃO EVITADA NO ESTADO FINAL - Palavra "${newFoundWord.word}" já existe`, {
        word: newFoundWord.word,
        existingWords: state.foundWords.map(fw => fw.word),
        attemptedWord: newFoundWord
      }, 'GAME_STATE');
      return;
    }

    logger.info(`📝 ADICIONANDO PALAVRA AO ESTADO - "${newFoundWord.word}" = ${newFoundWord.points} pontos`, {
      word: newFoundWord.word,
      points: newFoundWord.points,
      beforeCount: state.foundWords.length,
      afterCount: state.foundWords.length + 1,
      allWordsAfter: [...state.foundWords.map(fw => fw.word), newFoundWord.word]
    }, 'GAME_STATE');
    
    setState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, newFoundWord],
      permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
    }));
  };

  return {
    ...state,
    currentLevelScore,
    addFoundWord,
    setHintsUsed: (value: number | ((prev: number) => number)) => {
      setState(prev => ({ 
        ...prev, 
        hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value 
      }));
    },
    setHintHighlightedCells: (positions: Position[]) => {
      setState(prev => ({ ...prev, hintHighlightedCells: positions }));
    },
    setShowGameOver: (value: boolean) => {
      setState(prev => ({ ...prev, showGameOver: value }));
    },
    setShowLevelComplete: (value: boolean) => {
      setState(prev => ({ ...prev, showLevelComplete: value }));
    },
    setIsLevelCompleted: (value: boolean) => {
      setState(prev => ({ ...prev, isLevelCompleted: value }));
    }
  };
};
