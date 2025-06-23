
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
  // Create game config from challengeId
  const gameConfig = {
    level: 1,
    competitionId: challengeId
  };

  const {
    sessionId,
    gameStarted,
    gameCompleted,
    currentScore,
    wordsFound,
    isLoading,
    error,
    startGame,
    completeGame,
    resetGame
  } = useChallengeGameLogic(gameConfig);

  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(gameStarted);

  // Mock handlers for compatibility - these should be implemented properly
  const handleTimeUp = async () => {
    logger.info('Tempo esgotado', { challengeId, currentScore }, 'CHALLENGE_SCREEN');
    await completeGame(currentScore, wordsFound);
  };

  const handleLevelComplete = () => {
    logger.info('Nível completado', { challengeId, currentScore }, 'CHALLENGE_SCREEN');
  };

  const handleAdvanceLevel = () => {
    logger.info('Avançando nível', { challengeId }, 'CHALLENGE_SCREEN');
  };

  const handleRetry = () => {
    logger.info('Tentando novamente', { challengeId }, 'CHALLENGE_SCREEN');
    resetGame();
    startGame();
  };

  const handleStopGame = async () => {
    logger.info('Usuário parou o jogo', { 
      challengeId, 
      currentScore 
    }, 'CHALLENGE_SCREEN');
    onBack();
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      logger.info('Revive ativado', { 
        challengeId, 
        timeRemaining 
      }, 'CHALLENGE_SCREEN');
    } else {
      logger.warn('Falha ao ativar revive', { 
        challengeId 
      }, 'CHALLENGE_SCREEN');
    }
  };

  const handleCompleteGame = async () => {
    logger.info('Jogo finalizado', { 
      challengeId, 
      currentScore, 
      gameCompleted: true
    }, 'CHALLENGE_SCREEN');
    onBack();
  };

  const handleBackToMenu = () => {
    logger.info('Retorno ao menu principal', { 
      challengeId,
      currentScore 
    }, 'CHALLENGE_SCREEN');
    onBack();
  };

  const handleAdvanceLevelWithReset = () => {
    logger.debug('Avançando nível com reset', { 
      nextLevel: 2 
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
    return <GameifiedLoadingScreen level={1} loadingStep="Carregando..." />;
  }

  // Tela de jogo completado
  if (gameCompleted) {
    return (
      <ChallengeCompletedScreen
        totalScore={currentScore}
        onCompleteGame={handleCompleteGame}
      />
    );
  }

  // Verificar se temos uma sessão válida antes de renderizar o jogo
  if (!sessionId) {
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
      currentLevel={1}
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
