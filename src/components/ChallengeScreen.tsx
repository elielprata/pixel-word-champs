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
    handleWordFound,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  } = useChallengeGameLogic(challengeId);

  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(isGameStarted);

  const handleStopGame = async () => {
    logger.info('Usuário parou o jogo', { 
      challengeId, 
      currentLevel,
      totalScore 
    }, 'CHALLENGE_SCREEN');
    await markParticipationAsCompleted();
    onBack();
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

  const handleCompleteGame = async () => {
    logger.info('Jogo finalizado', { 
      challengeId, 
      totalScore, 
      currentLevel,
      gameCompleted: true
    }, 'CHALLENGE_SCREEN');
    await markParticipationAsCompleted();
    onBack();
  };

  const handleBackToMenu = () => {
    logger.info('Retorno ao menu principal', { 
      challengeId,
      currentLevel,
      totalScore 
    }, 'CHALLENGE_SCREEN');
    onBack();
  };

  const handleAdvanceLevelWithReset = () => {
    logger.debug('Avançando nível com reset', { 
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
      onWordFound={handleWordFound}
      onTimeUp={handleTimeUp}
      onLevelComplete={handleLevelComplete}
      onAdvanceLevel={handleAdvanceLevelWithReset}
      onStopGame={handleStopGame}
      onRevive={handleRevive}
    />
  );
};

export default ChallengeScreen;
