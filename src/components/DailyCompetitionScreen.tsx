
import React from 'react';
import { useIntegratedGameTimer } from '@/hooks/useIntegratedGameTimer';
import { useDailyGameLogic } from '@/hooks/useDailyGameLogic';
import CompetitionErrorDisplay from './competition/CompetitionErrorDisplay';
import CompetitionLoadingScreen from './competition/CompetitionLoadingScreen';
import CompetitionCompletedScreen from './competition/CompetitionCompletedScreen';
import CompetitionGameSession from './competition/CompetitionGameSession';
import { logger } from '@/utils/logger';

interface DailyCompetitionScreenProps {
  competitionId: string;
  onBack: () => void;
}

const DailyCompetitionScreen = ({ competitionId, onBack }: DailyCompetitionScreenProps) => {
  const {
    currentLevel,
    totalScore,
    gameSession,
    isGameStarted,
    gameCompleted,
    isLoading,
    error,
    handleWordFound,
    handleTimeUp,
    handleLevelComplete,
    handleAdvanceLevel,
    handleRetry,
    markParticipationAsCompleted
  } = useDailyGameLogic(competitionId);

  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(isGameStarted);

  const handleStopGame = async () => {
    logger.info('Usuário parou o jogo', { 
      competitionId, 
      currentLevel,
      totalScore 
    }, 'DAILY_COMPETITION_SCREEN');
    await markParticipationAsCompleted();
    onBack();
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      logger.info('Revive ativado', { 
        competitionId, 
        currentLevel,
        timeRemaining 
      }, 'DAILY_COMPETITION_SCREEN');
    } else {
      logger.warn('Falha ao ativar revive', { 
        competitionId, 
        currentLevel 
      }, 'DAILY_COMPETITION_SCREEN');
    }
  };

  const handleCompleteGame = async () => {
    logger.info('Jogo finalizado', { 
      competitionId, 
      totalScore, 
      currentLevel,
      gameCompleted: true
    }, 'DAILY_COMPETITION_SCREEN');
    await markParticipationAsCompleted();
    onBack();
  };

  const handleBackToMenu = () => {
    logger.info('Retorno ao menu principal', { 
      competitionId,
      currentLevel,
      totalScore 
    }, 'DAILY_COMPETITION_SCREEN');
    onBack();
  };

  const handleAdvanceLevelWithReset = () => {
    logger.debug('Avançando nível com reset', { 
      currentLevel,
      nextLevel: currentLevel + 1 
    }, 'DAILY_COMPETITION_SCREEN');
    handleAdvanceLevel();
    resetTimer();
  };

  // Tela de erro com opções claras
  if (error) {
    return (
      <CompetitionErrorDisplay
        error={error}
        onRetry={handleRetry}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Tela de loading
  if (isLoading) {
    return <CompetitionLoadingScreen />;
  }

  // Tela de jogo completado
  if (gameCompleted) {
    return (
      <CompetitionCompletedScreen
        totalScore={totalScore}
        onCompleteGame={handleCompleteGame}
      />
    );
  }

  // Verificar se temos uma sessão válida antes de renderizar o jogo
  if (!gameSession) {
    return (
      <CompetitionErrorDisplay
        error="Sessão de jogo não encontrada"
        onRetry={handleRetry}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <CompetitionGameSession
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

export default DailyCompetitionScreen;
