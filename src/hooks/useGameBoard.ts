
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedBoard } from '@/hooks/useOptimizedBoard';
import { useSimpleSelection } from '@/hooks/useSimpleSelection';
import { useGamePointsConfig } from '@/hooks/useGamePointsConfig';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { isLinearPath } from '@/hooks/word-selection/validateLinearPath';
import { type Position } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardState {
  foundWords: FoundWord[];
  hintsUsed: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
  isLevelCompleted: boolean;
}

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onWordFound,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const isMobile = useIsMobile();
  const { boardData, size, levelWords, isLoading, error } = useOptimizedBoard(level);
  const { getPointsForWord } = useGamePointsConfig();

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

  // Estado consolidado
  const [state, setState] = useState<GameBoardState>({
    foundWords: [],
    hintsUsed: 0,
    showGameOver: false,
    showLevelComplete: false,
    hintHighlightedCells: [],
    permanentlyMarkedCells: [],
    isLevelCompleted: false
  });

  // Reset state quando muda o nível
  useEffect(() => {
    logger.info(`Resetting game state for level ${level}`);
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
    if (timeLeft === 0 && !state.showGameOver) {
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver]);

  // Level Complete quando todas as palavras são encontradas
  useEffect(() => {
    if (state.foundWords.length === levelWords.length && 
        levelWords.length > 0 && 
        !state.showLevelComplete && 
        !state.isLevelCompleted) {
      
      const levelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);
      logger.info(`Level ${level} completed with score ${levelScore}`);
      
      setState(prev => ({ 
        ...prev, 
        showLevelComplete: true, 
        isLevelCompleted: true 
      }));
      
      updateUserScore(levelScore);
      onLevelComplete(levelScore);
    }
  }, [state.foundWords.length, levelWords.length, state.showLevelComplete, state.isLevelCompleted, level, onLevelComplete]);

  const updateUserScore = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        logger.error('Erro ao buscar perfil:', fetchError);
        return;
      }

      const currentScore = profile?.total_score || 0;
      const newScore = currentScore + points;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_score: newScore,
          games_played: (profile?.games_played || 0) + 1
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Erro ao atualizar pontuação:', updateError);
        return;
      }

      logger.info(`Pontuação atualizada: ${currentScore} → ${newScore} (+${points})`);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação do usuário:', error);
    }
  };

  // Adicionar palavra encontrada
  const addFoundWord = useCallback((word: string, positions: Position[]) => {
    setState(prev => {
      if (prev.foundWords.some(fw => fw.word === word)) {
        logger.warn(`Palavra já encontrada: "${word}"`);
        return prev;
      }

      const points = getPointsForWord(word);
      const newFoundWord = { word, positions: [...positions], points };
      
      logger.info(`Palavra adicionada: "${word}" = ${points} pontos`);
      
      onWordFound(word, points);
      
      return {
        ...prev,
        foundWords: [...prev.foundWords, newFoundWord],
        permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...positions]
      };
    });
  }, [getPointsForWord, onWordFound]);

  // Finalizar seleção com validação
  const handleCellEnd = useCallback(() => {
    const finalSelection = handleEnd();

    if (finalSelection.length >= 3 && isLinearPath(finalSelection)) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      const isValidWord = levelWords.includes(word);
      const isAlreadyFound = state.foundWords.some(fw => fw.word === word);

      logger.info('Tentativa de palavra', {
        word,
        level,
        isValid: isValidWord && !isAlreadyFound,
        alreadyFound: isAlreadyFound
      });

      if (isValidWord && !isAlreadyFound) {
        addFoundWord(word, finalSelection);
      }
    }
  }, [handleEnd, boardData.board, levelWords, state.foundWords, level, addFoundWord]);

  // Calcular seleção atual
  let selectedCells: Position[] = [];
  if (isDragging && startCell && currentCell) {
    selectedCells = getLinearPath(startCell, currentCell);
  }

  // Funções de verificação de células
  const isCellPermanentlyMarked = useCallback((row: number, col: number) => {
    return state.permanentlyMarkedCells.some(pos => pos.row === row && pos.col === col);
  }, [state.permanentlyMarkedCells]);

  const isCellHintHighlighted = useCallback((row: number, col: number) => {
    return state.hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  }, [state.hintHighlightedCells]);

  // Função para obter cor da palavra
  const getWordColor = useCallback((wordIndex: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-violet-600',
      'bg-gradient-to-br from-emerald-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-amber-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-teal-600',
    ];
    return colors[wordIndex % colors.length];
  }, []);

  const getCellWordIndex = useCallback((row: number, col: number) => {
    return state.foundWords.findIndex(fw =>
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  }, [state.foundWords]);

  // Interações do jogo (dicas, revive, etc.)
  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    state.foundWords,
    levelWords,
    boardData,
    state.hintsUsed,
    (value) => setState(prev => ({ ...prev, hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value })),
    (positions) => setState(prev => ({ ...prev, hintHighlightedCells: positions })),
    canRevive,
    () => {},
    (value) => setState(prev => ({ ...prev, showGameOver: value })),
    () => {}
  );

  const closeGameOver = useCallback(() => {
    setState(prev => ({ ...prev, showGameOver: false }));
  }, []);

  const currentLevelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);

  // Agrupar props relacionadas em objetos
  const boardProps = {
    boardData,
    size,
    selectedCells,
    isDragging
  };

  const gameStateProps = {
    foundWords: state.foundWords,
    levelWords,
    hintsUsed: state.hintsUsed,
    currentLevelScore
  };

  const modalProps = {
    showGameOver: state.showGameOver,
    showLevelComplete: state.showLevelComplete
  };

  const cellInteractionProps = {
    handleCellStart: handleStart,
    handleCellMove: handleDrag,
    handleCellEnd,
    isCellSelected,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    getWordColor,
    getCellWordIndex
  };

  const gameActions = {
    useHint,
    handleRevive,
    handleGoHome,
    closeGameOver
  };

  return {
    // Board data
    isLoading,
    error,
    isMobile,

    // Grouped props
    boardProps,
    gameStateProps,
    modalProps,
    cellInteractionProps,
    gameActions
  };
};
