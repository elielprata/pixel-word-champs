
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedBoard } from './useOptimizedBoard';
import { useGameState } from './useGameState';
import { useCellInteractions } from './useCellInteractions';
import { useOptimizedGameScoring } from './useOptimizedGameScoring';
import { useGameSessionManager } from './useGameSessionManager';
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

  // ✅ NOVA INTEGRAÇÃO: Hook para gerenciar sessões
  const {
    currentSession,
    addWordFound,
    startNewSession,
    completeSession,
    resetSession
  } = useGameSessionManager();

  // Hook para pontuação otimizada
  const {
    TOTAL_WORDS_REQUIRED,
    calculateLevelData,
    registerLevelCompletion,
    discardIncompleteLevel,
    isUpdatingScore
  } = useOptimizedGameScoring(level, boardData);

  // Estado do jogo - AGORA COM boardData - DECLARADO ANTES DO USO
  const gameState = useGameState(levelWords, timeLeft, onLevelComplete, boardData);

  // ✅ CORREÇÃO: Função integrada para salvar palavra encontrada
  const handleWordFound = useCallback(async (word: string, positions: Array<{row: number, col: number}>, points: number) => {
    logger.info('🎯 Palavra encontrada - iniciando salvamento', {
      word,
      points,
      positionsCount: positions.length,
      hasSession: !!currentSession,
      sessionId: currentSession?.sessionId
    }, 'GAME_BOARD');

    try {
      // 1. Salvar palavra na sessão do banco
      const wordSaved = await addWordFound(word, points, positions);
      
      if (!wordSaved) {
        logger.error('❌ Falha ao salvar palavra na sessão', { word, points }, 'GAME_BOARD');
        // Continuar mesmo se falhar - palavra será adicionada localmente
      } else {
        logger.info('✅ Palavra salva na sessão com sucesso', { 
          word, 
          points,
          sessionId: currentSession?.sessionId 
        }, 'GAME_BOARD');
      }

      // 2. Adicionar palavra ao estado local (sempre funciona)
      gameState.addFoundWord({ word, positions, points });
      
      logger.info('✅ Palavra adicionada ao estado local', {
        word,
        points,
        totalWordsFound: gameState.foundWords.length + 1
      }, 'GAME_BOARD');

    } catch (error) {
      logger.error('❌ Erro crítico ao processar palavra encontrada', {
        error,
        word,
        points
      }, 'GAME_BOARD');
      
      // Mesmo com erro, adicionar localmente
      gameState.addFoundWord({ word, positions, points });
    }
  }, [currentSession, addWordFound, gameState]);

  // Interações com células - ATUALIZADO para usar nossa função integrada
  const cellInteractions = useCellInteractions({
    foundWords: gameState.foundWords,
    permanentlyMarkedCells: gameState.permanentlyMarkedCells,
    hintHighlightedCells: gameState.hintHighlightedCells,
    boardData,
    levelWords,
    onWordFound: handleWordFound  // ✅ USANDO FUNÇÃO INTEGRADA
  });

  // ✅ CORREÇÃO: Inicializar sessão quando tudo estiver pronto
  useEffect(() => {
    if (boardData && levelWords.length > 0 && !gameInitialized.current && !currentSession) {
      logger.info('🔄 Inicializando sessão do jogo', { 
        level,
        boardDataExists: !!boardData,
        levelWordsCount: levelWords.length
      }, 'GAME_BOARD');

      startNewSession(level, boardData).then((session) => {
        if (session) {
          logger.info('✅ Sessão inicializada com sucesso', {
            sessionId: session.sessionId,
            level
          }, 'GAME_BOARD');
          gameInitialized.current = true;
          setIsLoading(false);
        } else {
          logger.error('❌ Falha ao inicializar sessão', { level }, 'GAME_BOARD');
          setError('Falha ao inicializar sessão de jogo');
          setIsLoading(false);
        }
      }).catch((error) => {
        logger.error('❌ Erro crítico ao inicializar sessão', { error, level }, 'GAME_BOARD');
        setError('Erro ao inicializar jogo');
        setIsLoading(false);
      });
    }
  }, [boardData, levelWords, startNewSession, level, currentSession]);

  // Verificar se há erro na seleção de palavras/board
  useEffect(() => {
    if (boardError) {
      setError(boardError);
      setIsLoading(false);
    }
  }, [boardError]);

  // ✅ CORREÇÃO CRÍTICA: Verificar conclusão do nível e finalizar sessão
  useEffect(() => {
    const { isLevelCompleted, currentLevelScore } = calculateLevelData(gameState.foundWords);
    
    if (isLevelCompleted && !showLevelComplete && !levelCompletionHandled.current) {
      logger.info('🏆 Nível completado! Finalizando sessão...', { 
        level, 
        score: currentLevelScore,
        wordsFound: gameState.foundWords.length,
        sessionId: currentSession?.sessionId
      }, 'GAME_BOARD');
      
      levelCompletionHandled.current = true;
      setShowLevelComplete(true);
      onLevelComplete(currentLevelScore);
      
      // ✅ NOVO: Completar sessão no banco em background
      if (currentSession) {
        completeSession(0).then(() => {
          logger.info('✅ Sessão completada no banco', {
            sessionId: currentSession.sessionId,
            level,
            score: currentLevelScore
          }, 'GAME_BOARD');
          
          // Depois registrar conclusão para atualizar perfil do usuário
          return registerLevelCompletion(gameState.foundWords, 0);
        }).then(() => {
          logger.info('✅ Pontuação do perfil atualizada', {
            level,
            score: currentLevelScore
          }, 'GAME_BOARD');
        }).catch((error) => {
          logger.error('❌ Erro ao finalizar sessão ou atualizar perfil', {
            error,
            level,
            sessionId: currentSession.sessionId
          }, 'GAME_BOARD');
        });
      } else {
        logger.warn('⚠️ Nível completado sem sessão ativa', {
          level,
          score: currentLevelScore
        }, 'GAME_BOARD');
      }
    }
  }, [gameState.foundWords, calculateLevelData, showLevelComplete, registerLevelCompletion, onLevelComplete, level, currentSession, completeSession]);

  // Game over quando tempo acabar
  useEffect(() => {
    if (timeLeft <= 0 && !showLevelComplete && !showGameOver) {
      logger.info('⏰ Tempo esgotado - descartando sessão incompleta', { 
        level, 
        foundWords: gameState.foundWords.length,
        sessionId: currentSession?.sessionId
      }, 'GAME_BOARD');
      
      // Resetar sessão local e descartar progresso
      resetSession();
      discardIncompleteLevel();
      setShowGameOver(true);
    }
  }, [timeLeft, showLevelComplete, showGameOver, discardIncompleteLevel, resetSession, level, gameState.foundWords.length, currentSession]);

  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu - descartando progresso', { 
      level,
      sessionId: currentSession?.sessionId
    }, 'GAME_BOARD');
    resetSession();
    discardIncompleteLevel();
  }, [discardIncompleteLevel, resetSession, level, currentSession]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  const { currentLevelScore } = calculateLevelData(gameState.foundWords);

  // ✅ LOG DE DEBUG: Estado atual
  useEffect(() => {
    logger.debug('🎮 Estado atual do GameBoard', {
      level,
      isLoading: isLoading || boardLoading,
      hasError: !!error,
      hasSession: !!currentSession,
      sessionId: currentSession?.sessionId,
      foundWordsCount: gameState.foundWords.length,
      targetWords: TOTAL_WORDS_REQUIRED,
      currentScore: currentLevelScore,
      gameInitialized: gameInitialized.current,
      levelCompletionHandled: levelCompletionHandled.current
    }, 'GAME_BOARD');
  }, [level, isLoading, boardLoading, error, currentSession, gameState.foundWords.length, currentLevelScore, TOTAL_WORDS_REQUIRED]);

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
