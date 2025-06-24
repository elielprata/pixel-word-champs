
import { useState, useEffect, useCallback } from 'react';
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
  levelWords: string[],
  timeLeft?: number,
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
  } = useGameScoring(state.foundWords, 1); // level default 1

  // Reset state quando muda as palavras do nível
  useEffect(() => {
    logger.info(`🔄 Resetando estado do jogo`, { wordCount: levelWords.length }, 'GAME_STATE');
    setState({
      foundWords: [],
      hintsUsed: 0,
      showGameOver: false,
      showLevelComplete: false,
      hintHighlightedCells: [],
      permanentlyMarkedCells: [],
      isLevelCompleted: false
    });
  }, [levelWords]);

  // Game Over quando tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver && !state.isLevelCompleted) {
      logger.info('⏰ Tempo esgotado - Game Over', { 
        foundWords: state.foundWords.length,
        targetWords: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED 
      }, 'GAME_STATE');
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver, state.isLevelCompleted, state.foundWords.length]);

  // Level complete quando atinge o número necessário de palavras
  useEffect(() => {
    if (isLevelCompleted && !state.showLevelComplete && !state.isLevelCompleted) {
      logger.info(`🎉 Nível COMPLETADO!`, {
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
          score: currentLevelScore
        }, 'GAME_STATE');
        onLevelComplete(currentLevelScore);
      }
      
      // Registrar pontos no banco
      updateUserScore(currentLevelScore);
    }
  }, [isLevelCompleted, state.showLevelComplete, state.isLevelCompleted, state.foundWords, currentLevelScore, updateUserScore, onLevelComplete]);

  const addFoundWord = useCallback((newFoundWord: FoundWord) => {
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
  }, [state.foundWords]);

  const useHint = useCallback(() => {
    if (state.hintsUsed >= 3) return; // Limite de dicas
    
    // Encontrar uma palavra não encontrada ainda
    const availableWords = levelWords.filter(word => 
      !state.foundWords.some(fw => fw.word === word)
    );
    
    if (availableWords.length === 0) return;
    
    // Simular highlight de uma palavra (implementação básica)
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    logger.info(`💡 Dica usada: ${randomWord}`, { hintsUsed: state.hintsUsed + 1 }, 'GAME_STATE');
    
    setState(prev => ({ 
      ...prev, 
      hintsUsed: prev.hintsUsed + 1,
      // Aqui você implementaria a lógica para destacar as células da palavra
      hintHighlightedCells: [] // TODO: implementar highlight das células
    }));
  }, [levelWords, state.foundWords, state.hintsUsed]);

  return {
    ...state,
    currentLevelScore,
    addFoundWord,
    useHint,
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
