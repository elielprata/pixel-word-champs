
import { useState, useCallback, useEffect } from 'react';
import { GameCell } from '@/types/game';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface GameState {
  selectedCells: GameCell[];
  foundWords: string[];
  score: number;
  timeLeft: number;
  gameStatus: 'playing' | 'paused' | 'completed' | 'failed';
  currentWord: string;
  isSelecting: boolean;
  permanentlyMarkedCells: GameCell[];
  hintHighlightedCells: GameCell[];
  hintsUsed: number;
}

const initialState: GameState = {
  selectedCells: [],
  foundWords: [],
  score: 0,
  timeLeft: 180,
  gameStatus: 'playing',
  currentWord: '',
  isSelecting: false,
  permanentlyMarkedCells: [],
  hintHighlightedCells: [],
  hintsUsed: 0,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const { toast } = useToast();

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    logger.debug('Atualizando estado do jogo', { updates }, 'GAME_STATE');
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const addFoundWord = useCallback((word: string, points: number) => {
    logger.info('Palavra encontrada', { word, points }, 'GAME_STATE');
    setGameState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, word],
      score: prev.score + points,
      selectedCells: [],
      currentWord: '',
      isSelecting: false,
    }));

    toast({
      title: "Palavra encontrada!",
      description: `${word} (+${points} pontos)`,
    });
  }, [toast]);

  const clearSelection = useCallback(() => {
    logger.debug('Limpando seleção', undefined, 'GAME_STATE');
    setGameState(prev => ({
      ...prev,
      selectedCells: [],
      currentWord: '',
      isSelecting: false,
    }));
  }, []);

  const startSelection = useCallback(() => {
    logger.debug('Iniciando seleção', undefined, 'GAME_STATE');
    setGameState(prev => ({ ...prev, isSelecting: true }));
  }, []);

  const addSelectedCell = useCallback((cell: GameCell) => {
    setGameState(prev => {
      const newWord = prev.currentWord + cell.letter;
      logger.debug('Adicionando célula selecionada', { 
        cell: { row: cell.row, col: cell.col, letter: cell.letter },
        newWord 
      }, 'GAME_STATE');
      
      return {
        ...prev,
        selectedCells: [...prev.selectedCells, cell],
        currentWord: newWord,
      };
    });
  }, []);

  const updateTimer = useCallback((timeLeft: number) => {
    setGameState(prev => {
      if (prev.timeLeft !== timeLeft) {
        logger.debug('Atualizando timer', { timeLeft }, 'GAME_STATE');
      }
      return { ...prev, timeLeft };
    });
  }, []);

  const completeGame = useCallback(() => {
    logger.info('Jogo completado', { 
      score: gameState.score, 
      wordsFound: gameState.foundWords.length 
    }, 'GAME_STATE');
    
    setGameState(prev => ({ ...prev, gameStatus: 'completed' }));
  }, [gameState.score, gameState.foundWords.length]);

  const resetGame = useCallback(() => {
    logger.info('Resetando jogo', undefined, 'GAME_STATE');
    setGameState(initialState);
  }, []);

  useEffect(() => {
    if (gameState.timeLeft <= 0 && gameState.gameStatus === 'playing') {
      logger.warn('Tempo esgotado', { finalScore: gameState.score }, 'GAME_STATE');
      setGameState(prev => ({ ...prev, gameStatus: 'failed' }));
    }
  }, [gameState.timeLeft, gameState.gameStatus, gameState.score]);

  return {
    gameState,
    updateGameState,
    addFoundWord,
    clearSelection,
    startSelection,
    addSelectedCell,
    updateTimer,
    completeGame,
    resetGame,
  };
};
