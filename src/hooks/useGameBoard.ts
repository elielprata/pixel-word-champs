
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useGameState } from './useGameState';
import { useCellInteractions } from './useCellInteractions';
import { useOptimizedGameScoring } from './useOptimizedGameScoring';
import { logger } from '@/utils/logger';
import { GAME_CONSTANTS } from '@/constants/game';

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
  const levelCompleteProcessed = useRef(false);
  const isProcessingCompletion = useRef(false);

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

  // Estado do jogo - AGORA SIMPLIFICADO
  const gameState = useGameState(levelWords, boardData);

  // Interações com células
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
      levelCompleteProcessed.current = false;
      isProcessingCompletion.current = false;
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

  // LÓGICA CONSOLIDADA DE DETECÇÃO DE CONCLUSÃO DO NÍVEL - PRIORIDADE MÁXIMA
  useEffect(() => {
    const wordsFoundCount = gameState.foundWords.length;
    const isLevelCompleted = wordsFoundCount >= GAME_CONSTANTS.TOTAL_WORDS_REQUIRED;
    
    logger.debug('🔍 Verificando conclusão do nível', { 
      wordsFoundCount, 
      totalRequired: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED,
      isLevelCompleted,
      showLevelComplete,
      showGameOver,
      levelCompleteProcessed: levelCompleteProcessed.current,
      isProcessingCompletion: isProcessingCompletion.current
    }, 'GAME_BOARD');

    // PRIORIDADE MÁXIMA: Se o nível foi completado, não mostrar game over
    if (isLevelCompleted && !levelCompleteProcessed.current && !isProcessingCompletion.current) {
      isProcessingCompletion.current = true;
      levelCompleteProcessed.current = true;
      
      logger.info('🏆 NÍVEL COMPLETADO! Processando conclusão', { 
        level, 
        wordsFoundCount,
        totalRequired: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED,
        foundWords: gameState.foundWords.map(fw => fw.word),
        currentScore: gameState.currentLevelScore
      }, 'GAME_BOARD');
      
      // GARANTIR que game over não apareça quando nível foi completado
      setShowGameOver(false);
      setShowLevelComplete(true);
      
      // Registrar conclusão do nível com dados completos
      registerLevelCompletion(gameState.foundWords, 0).then(() => {
        logger.info('📊 Pontuação registrada no banco com sucesso', { 
          score: gameState.currentLevelScore,
          foundWords: gameState.foundWords.length
        }, 'GAME_BOARD');
        
        // Notificar conclusão do nível APÓS salvar
        onLevelComplete(gameState.currentLevelScore);
        isProcessingCompletion.current = false;
      }).catch((error) => {
        logger.error('❌ Erro ao registrar conclusão do nível', { error }, 'GAME_BOARD');
        isProcessingCompletion.current = false;
      });
    }
  }, [gameState.foundWords, showLevelComplete, gameState.currentLevelScore, registerLevelCompletion, onLevelComplete, level, showGameOver]);

  // Game over APENAS quando tempo acabar E nível NÃO foi completado
  useEffect(() => {
    const wordsFoundCount = gameState.foundWords.length;
    const isLevelCompleted = wordsFoundCount >= GAME_CONSTANTS.TOTAL_WORDS_REQUIRED;
    
    // NUNCA mostrar game over se nível foi completado
    if (timeLeft <= 0 && !isLevelCompleted && !showLevelComplete && !showGameOver && !levelCompleteProcessed.current) {
      logger.info('⏰ Tempo esgotado - nível não completado', { 
        level, 
        foundWords: wordsFoundCount,
        totalRequired: GAME_CONSTANTS.TOTAL_WORDS_REQUIRED
      });
      discardIncompleteLevel();
      setShowGameOver(true);
    }
  }, [timeLeft, showLevelComplete, showGameOver, gameState.foundWords.length, discardIncompleteLevel, level]);

  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu - descartando progresso', { level });
    discardIncompleteLevel();
  }, [discardIncompleteLevel, level]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  const closeLevelComplete = useCallback(() => {
    logger.info('🔄 Fechando modal de nível completado', { level }, 'GAME_BOARD');
    setShowLevelComplete(false);
    levelCompleteProcessed.current = false;
    isProcessingCompletion.current = false;
  }, [level]);

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
      currentLevelScore: gameState.currentLevelScore
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
      closeGameOver,
      closeLevelComplete
    }
  };
};
