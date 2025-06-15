
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { useGameScoring } from '@/hooks/useGameScoring';
import { logger } from '@/utils/logger';

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

  // ETAPA 4: Usar hook especializado de pontuação
  const { 
    currentLevelScore, 
    isLevelCompleted, 
    TOTAL_WORDS_REQUIRED, 
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

  // Game Over quando tempo acaba (só se não completou o nível)
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver && !state.isLevelCompleted) {
      logger.info('⏰ Tempo esgotado - Game Over', { 
        level, 
        foundWords: state.foundWords.length,
        targetWords: TOTAL_WORDS_REQUIRED 
      }, 'GAME_STATE');
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver, state.isLevelCompleted, level, state.foundWords.length, TOTAL_WORDS_REQUIRED]);

  // CORREÇÃO DEFINITIVA: Lógica de level complete consolidada e otimizada
  useEffect(() => {
    if (isLevelCompleted && !state.showLevelComplete && !state.isLevelCompleted) {
      logger.info(`🎉 Nível ${level} COMPLETADO!`, {
        level,
        foundWordsCount: state.foundWords.length,
        totalWordsRequired: TOTAL_WORDS_REQUIRED,
        foundWords: state.foundWords.map(fw => fw.word),
        levelScore: currentLevelScore
      }, 'GAME_STATE');
      
      setState(prev => ({ 
        ...prev, 
        showLevelComplete: true, 
        isLevelCompleted: true 
      }));
      
      // CORREÇÃO DEFINITIVA: Notificar level complete via callback se fornecido
      if (onLevelComplete) {
        logger.info(`📞 CALLBACK - Notificando level complete: ${currentLevelScore} pontos`, {
          level,
          score: currentLevelScore
        }, 'GAME_STATE');
        onLevelComplete(currentLevelScore);
      }
      
      // Registrar pontos no banco quando completa o nível
      updateUserScore(currentLevelScore);
    }
  }, [isLevelCompleted, state.showLevelComplete, state.isLevelCompleted, state.foundWords, level, currentLevelScore, updateUserScore, TOTAL_WORDS_REQUIRED, onLevelComplete]);

  const addFoundWord = (newFoundWord: FoundWord) => {
    // PROTEÇÃO CRÍTICA: Verificar se a palavra já foi encontrada antes de adicionar
    const isAlreadyFound = state.foundWords.some(fw => fw.word === newFoundWord.word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ DUPLICAÇÃO EVITADA - Palavra "${newFoundWord.word}" já existe no estado - IGNORANDO`, {
        word: newFoundWord.word,
        currentWords: state.foundWords.map(fw => fw.word)
      }, 'GAME_STATE');
      return;
    }

    logger.info(`📝 ÚNICA FONTE DE VERDADE - Adicionando palavra "${newFoundWord.word}" = ${newFoundWord.points} pontos`, {
      word: newFoundWord.word,
      points: newFoundWord.points,
      beforeCount: state.foundWords.length,
      afterCount: state.foundWords.length + 1,
      targetWords: TOTAL_WORDS_REQUIRED
    }, 'GAME_STATE');
    
    setState(prev => {
      const newState = {
        ...prev,
        foundWords: [...prev.foundWords, newFoundWord],
        permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
      };
      
      logger.info(`✅ ESTADO FINAL ÚNICO - Total de palavras: ${newState.foundWords.length}`, {
        totalWords: newState.foundWords.length,
        words: newState.foundWords.map(fw => fw.word),
        isCompleted: newState.foundWords.length >= TOTAL_WORDS_REQUIRED,
        justAdded: newFoundWord.word
      }, 'GAME_STATE');
      
      return newState;
    });
  };

  const setHintsUsed = (value: number | ((prev: number) => number)) => {
    setState(prev => ({ 
      ...prev, 
      hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value 
    }));
  };

  const setHintHighlightedCells = (positions: Position[]) => {
    setState(prev => ({ ...prev, hintHighlightedCells: positions }));
  };

  const setShowGameOver = (value: boolean) => {
    setState(prev => ({ ...prev, showGameOver: value }));
  };

  const setShowLevelComplete = (value: boolean) => {
    setState(prev => ({ ...prev, showLevelComplete: value }));
  };

  const setIsLevelCompleted = (value: boolean) => {
    setState(prev => ({ ...prev, isLevelCompleted: value }));
  };

  return {
    ...state,
    currentLevelScore, // ETAPA 4: Pontuação vem do hook especializado
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
