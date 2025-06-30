
import React from 'react';
import { useIntegratedGameTimer } from '@/hooks/useIntegratedGameTimer';
import { useChallengeGameLogic } from '@/hooks/useChallengeGameLogic';
import ChallengeErrorDisplay from './challenge/ChallengeErrorDisplay';
import GameifiedLoadingScreen from './challenge/GameifiedLoadingScreen';
import ChallengeCompletedScreen from './challenge/ChallengeCompletedScreen';
import ChallengeGameSession from './challenge/ChallengeGameSession';
import { logger } from '@/utils/logger';

interface ChallengeScreenProps {
  challengeId: string;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    loadingStep,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  } = useChallengeGameLogic(challengeId);

  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(isGameStarted);

  // 🎯 FUNÇÃO CORRIGIDA: Navegação imediata com marcação em background
  const handleStopGame = async () => {
    logger.info('🛑 Usuário solicitou parar o jogo', { 
      challengeId, 
      currentLevel,
      totalScore 
    }, 'CHALLENGE_SCREEN');

    // 🎯 EXECUTAR NAVEGAÇÃO IMEDIATAMENTE
    const navigateBack = () => {
      logger.info('🏠 Navegando de volta ao menu principal');
      onBack();
    };

    try {
      // Tentar marcar participação rapidamente (máximo 2 segundos)
      const quickTimeout = new Promise((resolve) => setTimeout(resolve, 2000));
      const markingPromise = markParticipationAsCompleted();
      
      // Race entre marcar participação e timeout de 2 segundos
      await Promise.race([markingPromise, quickTimeout]);
      
      logger.info('✅ Participação marcada rapidamente');
    } catch (error) {
      logger.warn('⚠️ Marcação de participação demorou muito, mas continuando navegação');
    } finally {
      // 🎯 SEMPRE navegar, independentemente do resultado da marcação
      navigateBack();
    }

    // 🎯 CONTINUAR marcação em background se necessário
    markParticipationAsCompleted().catch(error => {
      logger.error('❌ Erro na marcação em background (não afeta navegação):', error);
    });
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      logger.info('Revive ativado', { 
        challengeId, 
        currentLevel,
        timeRemaining 
      }, 'CHALLENGE_SCREEN');
    } else {
      logger.warn('Falha ao ativar revive', { 
        challengeId, 
        currentLevel 
      }, 'CHALLENGE_SCREEN');
    }
  };

  // 🎯 FUNÇÃO CORRIGIDA: Navegação imediata com marcação em background
  const handleCompleteGame = async () => {
    logger.info('🎉 Jogo finalizado com sucesso', { 
      challengeId, 
      totalScore, 
      currentLevel,
      gameCompleted: true
    }, 'CHALLENGE_SCREEN');

    // Executar navegação imediatamente
    const navigateBack = () => {
      logger.info('🏠 Navegando de volta após completar jogo');
      onBack();
    };

    try {
      // Tentar marcar participação rapidamente
      const quickTimeout = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.race([markParticipationAsCompleted(), quickTimeout]);
    } catch (error) {
      logger.warn('⚠️ Marcação demorou, mas completando navegação');
    } finally {
      navigateBack();
    }
  };

  const handleBackToMenu = () => {
    logger.info('🔙 Retorno direto ao menu principal', { 
      challengeId,
      currentLevel,
      totalScore 
    }, 'CHALLENGE_SCREEN');
    
    // Navegação imediata sem esperar marcação
    onBack();
  };

  const handleAdvanceLevelWithReset = () => {
    logger.debug('⬆️ Avançando nível com reset', { 
      currentLevel,
      nextLevel: currentLevel + 1 
    }, 'CHALLENGE_SCREEN');
    handleAdvanceLevel();
    resetTimer();
  };

  // Tela de erro com opções claras
  if (error) {
    return (
      <ChallengeErrorDisplay
        error={error}
        onRetry={handleRetry}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Tela de loading gamificada
  if (isLoading) {
    return <GameifiedLoadingScreen level={currentLevel} loadingStep={loadingStep || 'Carregando...'} />;
  }

  // Tela de jogo completado
  if (gameCompleted) {
    return (
      <ChallengeCompletedScreen
        totalScore={totalScore}
        onCompleteGame={handleCompleteGame}
      />
    );
  }

  // Verificar se temos uma sessão válida antes de renderizar o jogo
  if (!gameSession) {
    return (
      <ChallengeErrorDisplay
        error="Sessão de jogo não encontrada"
        onRetry={handleRetry}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <ChallengeGameSession
      currentLevel={currentLevel}
      timeRemaining={timeRemaining}
      onTimeUp={handleTimeUp}
      onLevelComplete={handleLevelComplete}
      onAdvanceLevel={handleAdvanceLevelWithReset}
      onStopGame={handleStopGame}
      onRevive={handleRevive}
    />
  );
};

export default ChallengeScreen;
