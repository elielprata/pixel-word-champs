
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { challengeProgressService } from '@/services/challengeProgressService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

export const useChallengeGameLogic = (challengeId: string) => {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameSession, setGameSession] = useState<any>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasMarkedParticipation, setHasMarkedParticipation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Iniciando...');
  const [isResuming, setIsResuming] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // 🔧 CORREÇÃO: Usar refs para evitar loops infinitos
  const initializationRef = useRef<boolean>(false);
  const lastChallengeId = useRef<string>('');

  const maxLevels = 20;

  useEffect(() => {
    // 🔧 CORREÇÃO: Evitar múltiplas inicializações
    if (initializationRef.current && lastChallengeId.current === challengeId) {
      logger.debug('⚠️ Inicialização já executada, ignorando', { challengeId }, 'CHALLENGE_GAME_LOGIC');
      return;
    }

    initializationRef.current = true;
    lastChallengeId.current = challengeId;
    
    initializeGameSession();
  }, [challengeId]);

  const initializeGameSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStep('Preparando sessão...');
      
      logger.info('🎮 Inicializando sessão de jogo para competição:', { challengeId });
      
      // Verificar se a competição existe em custom_competitions
      setLoadingStep('Validando competição...');
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('id, title, status')
        .eq('id', challengeId)
        .single();

      if (competitionError) {
        logger.error('❌ Competição não encontrada:', competitionError);
        setError('Competição não encontrada. Verifique se o ID está correto.');
        return;
      }

      if (competition.status !== 'active') {
        logger.error('❌ Competição não está ativa:', competition.status);
        setError(`Competição não está ativa: ${competition.status}`);
        return;
      }

      // 🎯 CORREÇÃO: Definir variáveis locais para nível e pontuação ANTES de criar sessão  
      let levelToUse = 1;
      let scoreToUse = 0;
      let resuming = false;

      // Verificar progresso existente do usuário
      if (user) {
        setLoadingStep('Verificando progresso...');
        const existingProgress = await challengeProgressService.getProgress(user.id, challengeId);
        
        if (existingProgress) {
          if (existingProgress.is_completed) {
            logger.info('🏆 Usuário já completou esta competição', { 
              challengeId,
              userId: user.id,
              finalScore: existingProgress.total_score 
            });
            setAlreadyCompleted(true);
            setTotalScore(existingProgress.total_score);
            setCurrentLevel(20);
            setLoadingStep('Competição já concluída!');
            return;
          } else {
            // 🎯 CORREÇÃO: Usar progresso existente nas variáveis locais
            levelToUse = existingProgress.current_level;
            scoreToUse = existingProgress.total_score;
            resuming = true;
            
            logger.info('🔄 Retomando progresso existente', { 
              challengeId,
              userId: user.id,
              currentLevel: levelToUse,
              totalScore: scoreToUse
            });
            
            setLoadingStep(`Continuando do nível ${levelToUse}...`);
          }
        } else {
          setLoadingStep('Iniciando novo desafio...');
        }
      }

      // 🎯 CORREÇÃO: Definir estados com valores corretos ANTES de criar sessão
      setCurrentLevel(levelToUse);
      setTotalScore(scoreToUse);
      setIsResuming(resuming);

      logger.info('✅ Competição validada, criando sessão de jogo...', {
        levelToUse,
        scoreToUse,
        resuming
      });
      setLoadingStep('Criando sessão de jogo...');
      
      // 🎯 CORREÇÃO: Criar sessão com o nível correto
      const sessionResponse = await gameService.createGameSession({
        level: levelToUse,
        boardSize: 10,
        competitionId: challengeId
      });

      if (!sessionResponse.success) {
        logger.error('❌ Erro ao criar sessão:', sessionResponse.error);
        setError(sessionResponse.error || 'Erro ao criar sessão de jogo');
        return;
      }

      const session = sessionResponse.data;
      logger.info('✅ Sessão de jogo criada:', {
        sessionId: session.id,
        level: levelToUse,
        score: scoreToUse,
        resuming
      });
      
      setGameSession(session);
      setIsGameStarted(true);
      setLoadingStep('Sessão criada com sucesso!');
      
    } catch (error) {
      logger.error('❌ Erro inesperado ao inicializar sessão:', error);
      setError('Erro inesperado ao carregar o jogo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 FUNÇÃO CORRIGIDA: Melhor tratamento de erro e timeout
  const markParticipationAsCompleted = async (): Promise<boolean> => {
    if (hasMarkedParticipation || !user) {
      logger.info('Participação já foi marcada como concluída ou usuário não logado');
      return true;
    }

    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );

    try {
      logger.info('🏁 Iniciando marcação de participação como concluída...', {
        challengeId,
        userId: user.id,
        gameSessionId: gameSession?.id
      });

      await Promise.race([
        (async () => {
          await competitionParticipationService.markUserAsParticipated(challengeId, user.id);
          if (gameSession?.id) {
            await gameService.completeGameSession(gameSession.id);
          }
        })(),
        timeout
      ]);

      setHasMarkedParticipation(true);
      logger.info('✅ Participação marcada como concluída com sucesso');
      return true;

    } catch (error) {
      logger.error('❌ Erro ao marcar participação (mas continuando navegação):', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message
        } : error,
        challengeId,
        userId: user.id
      });
      
      return false;
    }
  };

  const handleTimeUp = () => {
    logger.info('Tempo esgotado!');
  };

  // 🎯 NOVA FUNÇÃO: Salvar progresso com verificação e retry
  const saveProgressWithRetry = async (levelCompleted: number, scoreToSave: number, maxRetries: number = 3): Promise<boolean> => {
    if (!user) {
      logger.error('❌ Usuário não logado, não é possível salvar progresso');
      return false;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`💾 Tentativa ${attempt}/${maxRetries} de salvar progresso`, {
          level: levelCompleted,
          score: scoreToSave,
          challengeId,
          userId: user.id
        });

        const saveSuccess = await challengeProgressService.saveProgress({
          userId: user.id,
          competitionId: challengeId,
          // 🎯 CORREÇÃO CRÍTICA: Salvar próximo nível, não o nível completado
          currentLevel: levelCompleted < maxLevels ? levelCompleted + 1 : levelCompleted,
          totalScore: scoreToSave,
          isCompleted: levelCompleted >= maxLevels
        });

        if (saveSuccess) {
          logger.info(`✅ Progresso salvo com sucesso na tentativa ${attempt}!`, {
            completedLevel: levelCompleted,
            nextLevel: levelCompleted < maxLevels ? levelCompleted + 1 : levelCompleted,
            score: scoreToSave,
            challengeId
          });
          return true;
        } else {
          logger.warn(`⚠️ Falha ao salvar progresso na tentativa ${attempt}`, {
            level: levelCompleted,
            score: scoreToSave,
            challengeId,
            attemptsRemaining: maxRetries - attempt
          });
        }
      } catch (error) {
        logger.error(`❌ Erro ao salvar progresso na tentativa ${attempt}:`, {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message
          } : error,
          level: levelCompleted,
          score: scoreToSave,
          challengeId,
          attemptsRemaining: maxRetries - attempt
        });
      }

      // Esperar antes da próxima tentativa (exceto na última)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    logger.error('❌ Falha ao salvar progresso após todas as tentativas', {
      level: levelCompleted,
      score: scoreToSave,
      challengeId,
      maxRetries
    });
    return false;
  };

  // 🎯 FUNÇÃO CORRIGIDA: Sempre salvar progresso quando nível for completado
  const handleLevelComplete = async (levelScore: number) => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    logger.info('🎉 Nível completado - Salvando progresso IMEDIATAMENTE!', {
      completedLevel: currentLevel,
      levelScore,
      newTotalScore,
      challengeId,
      userId: user?.id
    });
    
    // 🎯 CORREÇÃO: Salvar próximo nível (currentLevel + 1) ou marcar como completo se foi o último
    const saveSuccess = await saveProgressWithRetry(currentLevel, newTotalScore);
    
    if (saveSuccess) {
      logger.info('✅ Progresso garantido após completar nível!', {
        completedLevel: currentLevel,
        nextLevel: currentLevel < maxLevels ? currentLevel + 1 : currentLevel,
        totalScore: newTotalScore,
        challengeId
      });
    } else {
      logger.error('❌ CRÍTICO: Falha ao salvar progresso após completar nível', {
        level: currentLevel,
        totalScore: newTotalScore,
        challengeId
      });
    }
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < maxLevels) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setIsGameStarted(false);
      
      // 🎯 CORREÇÃO: Progresso já foi salvo em handleLevelComplete
      // Não precisamos salvar novamente aqui
      
      setTimeout(() => {
        setIsGameStarted(true);
      }, 100);
      
      logger.info(`Avançando para o nível ${nextLevel}`);
    } else {
      // Completou todos os 20 níveis
      if (user) {
        challengeProgressService.markAsCompleted(user.id, challengeId, totalScore);
      }
      setGameCompleted(true);
      logger.info('🎉 Você completou todos os 20 níveis!');
    }
  };

  const handleRetry = () => {
    logger.info('🔄 Tentando novamente...');
    setError(null);
    setGameSession(null);
    setIsGameStarted(false);
    setHasMarkedParticipation(false);
    setAlreadyCompleted(false);
    setIsResuming(false);
    setCurrentLevel(1);
    setTotalScore(0);
    
    // 🔧 CORREÇÃO: Resetar refs para permitir nova inicialização
    initializationRef.current = false;
    lastChallengeId.current = '';
    
    initializeGameSession();
  };

  return {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    loadingStep,
    isResuming,
    alreadyCompleted,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  };
};
