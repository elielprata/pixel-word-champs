import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameSessionManager } from './useGameSessionManager';
import { useChallengeProgress } from './useChallengeProgress';
import { logger } from '@/utils/logger';

export const useChallengeGameLogic = (challengeId: string) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  
  // Refs para prevenir múltiplas execuções
  const isProcessingLevelComplete = useRef(false);
  const sessionCompletionInProgress = useRef(false);

  const {
    currentSession,
    isLoading: sessionLoading,
    error: sessionError,
    startNewSession,
    completeSession,
    resetSession
  } = useGameSessionManager();

  const {
    progress,
    isLoading: progressLoading,
    updateChallengeProgress,
    completeChallengeProgress
  } = useChallengeProgress(challengeId);

  useEffect(() => {
    const initializeGame = async () => {
      setIsLoading(true);
      setLoadingStep('Iniciando desafio...');
      setError(null);
  
      try {
        // Carregar progresso existente
        setLoadingStep('Carregando progresso...');
        if (progress) {
          setCurrentLevel(progress.current_level);
          setTotalScore(progress.total_score);
        }
  
        // Iniciar nova sessão de jogo
        setLoadingStep('Iniciando sessão de jogo...');
        const session = await startNewSession(currentLevel, challengeId);
        if (!session) {
          throw new Error('Falha ao iniciar sessão de jogo');
        }
  
        setIsGameStarted(true);
        logger.info('Desafio iniciado com sucesso', { 
          challengeId, 
          currentLevel, 
          totalScore 
        }, 'CHALLENGE_GAME_LOGIC');
      } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'Erro ao iniciar desafio';
        setError(errorMessage);
        logger.error('Erro ao iniciar desafio', { 
          error: err, 
          challengeId 
        }, 'CHALLENGE_GAME_LOGIC');
      } finally {
        setIsLoading(false);
        setLoadingStep('');
      }
    };
  
    if (challengeId) {
      initializeGame();
    }
  
    return () => {
      setIsGameStarted(false);
      isProcessingLevelComplete.current = false;
      sessionCompletionInProgress.current = false;
    };
  }, [challengeId, startNewSession, progress, currentLevel]);

  const handleLevelComplete = useCallback(async (levelScore: number) => {
    // PROTEÇÃO: Evitar múltiplas execuções simultâneas
    if (isProcessingLevelComplete.current) {
      logger.warn('⚠️ Conclusão de nível já está sendo processada', { 
        currentLevel, 
        levelScore 
      }, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    isProcessingLevelComplete.current = true;

    try {
      logger.info('🏆 Processando conclusão do nível', { 
        currentLevel, 
        levelScore,
        totalScore: totalScore + levelScore
      }, 'CHALLENGE_GAME_LOGIC');

      // Atualizar pontuação total IMEDIATAMENTE
      const newTotalScore = totalScore + levelScore;
      setTotalScore(newTotalScore);

      // Salvar progresso no banco de dados
      await updateChallengeProgress(currentLevel, newTotalScore);

      logger.info('✅ Conclusão do nível processada com sucesso', { 
        currentLevel, 
        levelScore, 
        newTotalScore 
      }, 'CHALLENGE_GAME_LOGIC');

    } catch (error) {
      logger.error('❌ Erro ao processar conclusão do nível', { 
        error, 
        currentLevel, 
        levelScore 
      }, 'CHALLENGE_GAME_LOGIC');
      setError('Erro ao salvar progresso do nível');
    } finally {
      isProcessingLevelComplete.current = false;
    }
  }, [currentLevel, totalScore, updateChallengeProgress]);

  const handleAdvanceLevel = useCallback(() => {
    logger.info('▶️ Avançando para próximo nível', { 
      currentLevel,
      nextLevel: currentLevel + 1,
      totalScore 
    }, 'CHALLENGE_GAME_LOGIC');

    // Reset dos refs de proteção
    isProcessingLevelComplete.current = false;
    sessionCompletionInProgress.current = false;

    if (currentLevel >= 20) {
      setGameCompleted(true);
      logger.info('🎉 Jogo completado - 20 níveis finalizados!', { 
        totalScore 
      }, 'CHALLENGE_GAME_LOGIC');
    } else {
      setCurrentLevel(prev => prev + 1);
    }
  }, [currentLevel, totalScore]);

  const handleStopGame = useCallback(async () => {
    // PROTEÇÃO: Evitar múltiplas execuções simultâneas
    if (sessionCompletionInProgress.current) {
      logger.warn('⚠️ Finalização de sessão já está sendo processada', {}, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    sessionCompletionInProgress.current = true;

    try {
      logger.info('🛑 Finalizando jogo', { 
        currentLevel, 
        totalScore,
        gameCompleted: false
      }, 'CHALLENGE_GAME_LOGIC');

      await markParticipationAsCompleted();

    } catch (error) {
      logger.error('❌ Erro ao finalizar jogo', { error }, 'CHALLENGE_GAME_LOGIC');
    } finally {
      sessionCompletionInProgress.current = false;
    }
  }, [currentLevel, totalScore]);

  const markParticipationAsCompleted = useCallback(async () => {
    if (!currentSession) {
      logger.warn('⚠️ Não há sessão ativa para completar', {}, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    try {
      logger.info('📊 Finalizando sessão de jogo', { 
        sessionId: currentSession.sessionId,
        totalScore,
        currentLevel
      }, 'CHALLENGE_GAME_LOGIC');

      // Completar a sessão no banco
      const result = await completeSession(0, challengeId);
      
      if (result?.session) {
        // Atualizar progresso final do desafio
        await completeChallengeProgress(totalScore);
        
        logger.info('✅ Participação marcada como completada', { 
          totalScore, 
          currentLevel 
        }, 'CHALLENGE_GAME_LOGIC');
      }
    } catch (error) {
      logger.error('❌ Erro ao marcar participação como completada', { 
        error 
      }, 'CHALLENGE_GAME_LOGIC');
    }
  }, [currentSession, totalScore, currentLevel, completeSession, completeChallengeProgress, challengeId]);

  const handleTimeUp = useCallback(() => {
    logger.info('⏰ Tempo esgotado', { 
      currentLevel, 
      totalScore 
    }, 'CHALLENGE_GAME_LOGIC');
    handleStopGame();
  }, [handleStopGame, currentLevel, totalScore]);

  const handleRetry = useCallback(() => {
    logger.info('🔄 Retentando iniciar o jogo', { 
      challengeId, 
      currentLevel, 
      totalScore 
    }, 'CHALLENGE_GAME_LOGIC');
    resetSession();
    setCurrentLevel(1);
    setTotalScore(0);
    setIsGameStarted(false);
    setGameCompleted(false);
    setError(null);
    isProcessingLevelComplete.current = false;
    sessionCompletionInProgress.current = false;
  }, [challengeId, resetSession]);

  return {
    currentLevel,
    totalScore,
    gameSession: currentSession,
    isGameStarted,
    gameCompleted,
    isLoading: isLoading || sessionLoading || progressLoading,
    error: error || sessionError,
    loadingStep,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleStopGame,
    handleRetry,
    markParticipationAsCompleted
  };
};
