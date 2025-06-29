
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

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
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
  const sessionStable = useRef(false);

  // Hook para board otimizado
  const { 
    boardData, 
    size,
    levelWords, 
    isLoading: boardLoading,
    error: boardError,
    isWordSelectionError
  } = useOptimizedBoard(level);

  // ✅ SESSÃO ESTÁVEL: Hook para gerenciar sessões com estado persistente
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

  // ✅ PROTEÇÃO CONTRA PERDA DE SESSÃO: Tentar recriar sessão se perdida
  const ensureSessionExists = useCallback(async () => {
    if (!currentSession && sessionStable.current && boardData && levelWords.length > 0) {
      logger.warn('🔄 SESSÃO PERDIDA DETECTADA - Tentando recriar', {
        level,
        hadStableSession: sessionStable.current,
        hasBoardData: !!boardData
      }, 'GAME_BOARD');

      const newSession = await startNewSession(level, boardData);
      if (newSession) {
        logger.info('✅ SESSÃO RECRIADA COM SUCESSO', {
          sessionId: newSession.sessionId,
          level
        }, 'GAME_BOARD');
        return newSession;
      } else {
        logger.error('❌ FALHA AO RECRIAR SESSÃO PERDIDA', { level }, 'GAME_BOARD');
        return null;
      }
    }
    return currentSession;
  }, [currentSession, sessionStable.current, boardData, levelWords, startNewSession, level]);

  // ✅ FUNÇÃO ROBUSTA: Salvamento com fallbacks e retry
  const handleWordFound = useCallback(async (foundWord: FoundWord) => {
    const { word, positions, points } = foundWord;
    const wordId = `${word}-${Date.now()}`;
    
    logger.info('🎯 Palavra encontrada - iniciando salvamento robusto', {
      wordId,
      word,
      points,
      positionsCount: positions.length,
      hasSession: !!currentSession,
      sessionId: currentSession?.sessionId
    }, 'GAME_BOARD');

    // 1. SEMPRE adicionar palavra ao estado visual PRIMEIRO (experiência imediata)
    gameState.addFoundWord(foundWord);
    
    logger.info('✅ Palavra adicionada IMEDIATAMENTE ao estado visual', {
      wordId,
      word,
      points,
      totalWordsFound: gameState.foundWords.length + 1
    }, 'GAME_BOARD');

    // 2. Tentar salvar no banco em BACKGROUND com fallbacks
    try {
      // Garantir que temos uma sessão ativa
      let activeSession = currentSession;
      if (!activeSession) {
        logger.warn('⚠️ Sessão não encontrada, tentando recriar', { wordId, word }, 'GAME_BOARD');
        activeSession = await ensureSessionExists();
      }

      if (activeSession) {
        const wordSaved = await addWordFound(word, points, positions);
        
        if (wordSaved) {
          logger.info('✅ Palavra salva no banco com sucesso', { 
            wordId,
            word, 
            points,
            sessionId: activeSession.sessionId 
          }, 'GAME_BOARD');
        } else {
          logger.error('❌ Falha ao salvar palavra no banco (mas visual já foi atualizado)', { 
            wordId,
            word, 
            points 
          }, 'GAME_BOARD');
        }
      } else {
        logger.error('❌ Não foi possível obter/recriar sessão para salvar palavra', {
          wordId,
          word,
          points
        }, 'GAME_BOARD');
      }

    } catch (error) {
      logger.error('❌ Erro crítico ao processar palavra encontrada (mas visual já foi atualizado)', {
        wordId,
        error,
        word,
        points
      }, 'GAME_BOARD');
    }
  }, [currentSession, addWordFound, gameState, ensureSessionExists]);

  // Interações com células - ATUALIZADO para usar nossa função robusta
  const cellInteractions = useCellInteractions({
    foundWords: gameState.foundWords,
    permanentlyMarkedCells: gameState.permanentlyMarkedCells,
    hintHighlightedCells: gameState.hintHighlightedCells,
    boardData,
    levelWords,
    onWordFound: handleWordFound
  });

  // ✅ INICIALIZAÇÃO ESTÁVEL: Sessão com proteção contra re-criação
  useEffect(() => {
    if (boardData && levelWords.length > 0 && !gameInitialized.current && !currentSession) {
      logger.info('🔄 Inicializando sessão estável do jogo', { 
        level,
        boardDataExists: !!boardData,
        levelWordsCount: levelWords.length
      }, 'GAME_BOARD');

      startNewSession(level, boardData).then((session) => {
        if (session) {
          logger.info('✅ Sessão inicializada com sucesso - ESTÁVEL', {
            sessionId: session.sessionId,
            level
          }, 'GAME_BOARD');
          gameInitialized.current = true;
          sessionStable.current = true;
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

  // ✅ CONCLUSÃO DE NÍVEL: Protegida e estável
  useEffect(() => {
    const { isLevelCompleted, currentLevelScore } = calculateLevelData(gameState.foundWords);
    
    if (isLevelCompleted && !showLevelComplete && !levelCompletionHandled.current) {
      logger.info('🏆 Nível completado! Finalizando sessão estável...', { 
        level, 
        score: currentLevelScore,
        wordsFound: gameState.foundWords.length,
        sessionId: currentSession?.sessionId,
        sessionStable: sessionStable.current
      }, 'GAME_BOARD');
      
      levelCompletionHandled.current = true;
      setShowLevelComplete(true);
      onLevelComplete(currentLevelScore);
      
      // ✅ Completar sessão no banco se disponível
      if (currentSession && sessionStable.current) {
        completeSession(0).then(() => {
          logger.info('✅ Sessão completada no banco com sucesso', {
            sessionId: currentSession.sessionId,
            level,
            score: currentLevelScore
          }, 'GAME_BOARD');
          
          return registerLevelCompletion(gameState.foundWords, 0);
        }).then(() => {
          logger.info('✅ Pontuação do perfil atualizada com sucesso', {
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
        logger.warn('⚠️ Nível completado sem sessão estável - apenas registrando pontuação', {
          level,
          score: currentLevelScore,
          hasSession: !!currentSession,
          sessionStable: sessionStable.current
        }, 'GAME_BOARD');

        // Mesmo sem sessão, registrar pontuação se possível
        registerLevelCompletion(gameState.foundWords, 0).catch((error) => {
          logger.error('❌ Erro ao registrar pontuação sem sessão', {
            error,
            level,
            score: currentLevelScore
          }, 'GAME_BOARD');
        });
      }
    }
  }, [gameState.foundWords, calculateLevelData, showLevelComplete, registerLevelCompletion, onLevelComplete, level, currentSession, completeSession, sessionStable.current]);

  // Game over quando tempo acabar
  useEffect(() => {
    if (timeLeft <= 0 && !showLevelComplete && !showGameOver) {
      logger.info('⏰ Tempo esgotado - limpando estados', { 
        level, 
        foundWords: gameState.foundWords.length,
        sessionId: currentSession?.sessionId,
        sessionStable: sessionStable.current
      }, 'GAME_BOARD');
      
      sessionStable.current = false;
      resetSession();
      discardIncompleteLevel();
      setShowGameOver(true);
    }
  }, [timeLeft, showLevelComplete, showGameOver, discardIncompleteLevel, resetSession, level, gameState.foundWords.length, currentSession]);

  const handleGoHome = useCallback(() => {
    logger.info('🏠 Voltando ao menu - limpando estados', { 
      level,
      sessionId: currentSession?.sessionId,
      sessionStable: sessionStable.current
    }, 'GAME_BOARD');
    sessionStable.current = false;
    resetSession();
    discardIncompleteLevel();
  }, [discardIncompleteLevel, resetSession, level, currentSession]);

  const closeGameOver = useCallback(() => {
    setShowGameOver(false);
  }, []);

  const { currentLevelScore } = calculateLevelData(gameState.foundWords);

  // MONITORAMENTO: Estado da sessão
  useEffect(() => {
    logger.debug('🎮 Estado da sessão GameBoard', {
      level,
      hasSession: !!currentSession,
      sessionId: currentSession?.sessionId,
      sessionStable: sessionStable.current,
      foundWordsCount: gameState.foundWords.length,
      targetWords: TOTAL_WORDS_REQUIRED,
      currentScore: currentLevelScore,
      gameInitialized: gameInitialized.current
    }, 'GAME_BOARD');
  }, [level, currentSession, gameState.foundWords.length, currentLevelScore, TOTAL_WORDS_REQUIRED]);

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
