
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useGameState } from './useGameState';
import { useCellInteractions } from './useCellInteractions';
import { useOptimizedGameScoring } from './useOptimizedGameScoring';
import { logger } from '@/utils/logger';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onLevelComplete: (levelScore: number) => void;
  canRevive: boolean;
  onRevive?: () => void;
}

export const useGameBoard = ({
  level,
  timeLeft,
  onLevelComplete,
  canRevive,
  onRevive
}: GameBoardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const gameInitialized = useRef(false);
  const levelCompletionHandled = useRef(false);

  // Hook para board otimizado
  const { 
    boardData, 
    size,
    levelWords, 
    isLoading: boardLoading,
    error: boardError,
    isWordSelectionError
  } = useOptimizedBoard(level);

  // Hook para pontuação otimizada
  const {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    initializeSession,
    isUpdatingScore
  } = useOptimizedGameScoring(level, boardData);

  // Estado do jogo - AGORA COM boardData
  const gameState = useGameState(levelWords, timeLeft, onLevelComplete, boardData);

  // Interações com células - ATUALIZADO para incluir validação de palavras
  const cellInteractions = useCellInteractions({
    foundWords: gameState.foundWords,
    permanentlyMarkedCells: gameState.permanentlyMarkedCells,
    hintHighlightedCells: gameState.hintHighlightedCells,
    boardData,
    levelWords,
    onWordFound: gameState.addFoundWord
  });

  // Inicializar sessão quando o jogo estiver pronto
  useEffect(() => {
    if (boardData && levelWords.length > 0 && !gameInitialized.current) {
      initializeSession();
      gameInitialized.current = true;
      setIsLoading(false);
      logger.info('🎮 Jogo inicializado - sessão em memória criada', { level });
    }
  }, [boardData, levelWords, initializeSession, level]);

  // Verificar se há erro na seleção de palavras/board
  useEffect(() => {
    if (boardError) {
      setError(boardError);
      setIsLoading(false);
    }
  }, [boardError]);

  // ✅ CORREÇÃO CRÍTICA: Modal aparece IMEDIATAMENTE baseado no estado local
  useEffect(() => {
    const { isLevelCompleted, currentLevelScore } = calculateLevelData(gameState.foundWords);
    
    // Modal aparece imediatamente quando 5 palavras são encontradas
    if (isLevelCompleted && !showLevelComplete && !levelCompletionHandled.current) {
      logger.info('🏆 Nível completado! Mostrando modal IMEDIATAMENTE', { 
        level, 
        score: currentLevelScore,
        wordsFound: gameState.foundWords.length 
      });
      
      setShowLevelComplete(true);
      levelCompletionHandled.current = true;
      
      // Notificar callback imediatamente
      onLevelComplete(currentLevelScore);
      
      // ⚡ Registrar conclusão no banco em BACKGROUND (não bloquear modal)
      registerLevelCompletion(gameState.foundWords, 0).then(() => {
        logger.info('✅ Sessão salva no banco com sucesso (background)', {
          level,
          score: currentLevelScore
        });
      }).catch((error) => {
        logger.error('❌ Erro ao salvar sessão no banco (background):', error);
        // Usuário já viu o modal e pode continuar jogando
      });
    }
  }, [gameState.foundWords, calculateLevelData, showLevelComplete, registerLevelCompletion, onLevelComplete, level]);

  // Game over quando tempo acabar
  useEffect(() => {
    if (timeLeft <= 0 && !showLevelComplete && !showGameOver) {
      logger.info('⏰ Tempo esgotado - nível não completado', { level, foundWords: gameState.foundWords.length });
      discardIncompleteLevel();
      setShowGameOver(true);
    }
  }, [timeLeft, showLevelComplete, showGameOver, discardIncompleteLevel, level, gameState.foundWords.length]);

  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu - descartando progresso', { level });
    discardIncompleteLevel();
  }, [discardIncompleteLevel, level]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  const { currentLevelScore } = calculateLevelData(gameState.foundWords);

  return {
    isLoading: isLoading || boardLoading,
    error,
    isWordSelectionError,
    boardProps: {
      boardData,
      size,
      selectedCells: cellInteractions.selectedCells,
      isDragging: cellInteractions.isDragging
    },
    gameStateProps: {
      foundWords: gameState.foundWords,
      levelWords,
      hintsUsed: gameState.hintsUsed,
      currentLevelScore
    },
    modalProps: {
      showGameOver,
      showLevelComplete
    },
    cellInteractionProps: {
      handleCellStart: cellInteractions.handleCellStart,
      handleCellMove: cellInteractions.handleCellMove,
      handleCellEnd: cellInteractions.handleCellEnd,
      isCellSelected: cellInteractions.isCellSelected,
      isCellPermanentlyMarked: cellInteractions.isCellPermanentlyMarked,
      isCellHintHighlighted: cellInteractions.isCellHintHighlighted,
      getCellWordIndex: cellInteractions.getCellWordIndex,
      getWordColor: cellInteractions.getWordColor
    },
    gameActions: {
      useHint: gameState.useHint,
      handleGoHome,
      closeGameOver
    }
  };
};
