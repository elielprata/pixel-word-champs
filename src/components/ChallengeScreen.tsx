
import React from 'react';
import { useIntegratedGameTimer } from '@/hooks/useIntegratedGameTimer';
import { useCompetitionGameLogic } from '@/hooks/useCompetitionGameLogic';
import CompetitionErrorDisplay from './challenge/CompetitionErrorDisplay';
import CompetitionLoadingScreen from './challenge/CompetitionLoadingScreen';
import CompetitionCompletedScreen from './challenge/CompetitionCompletedScreen';
import CompetitionGameSession from './challenge/CompetitionGameSession';
import { logger } from '@/utils/logger';

interface CompetitionScreenProps {
  competitionId: string;
  onBack: () => void;
}

const CompetitionScreen = ({ competitionId, onBack }: CompetitionScreenProps) => {
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
  } = useCompetitionGameLogic(competitionId);

  const { timeRemaining, extendTime, resetTimer } = useIntegratedGameTimer(isGameStarted);

  const handleStopGame = async () => {
    logger.info('Usuário parou o jogo', { 
      competitionId, 
      currentLevel,
      totalScore 
    }, 'COMPETITION_SCREEN');
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
      }, 'COMPETITION_SCREEN');
    } else {
      logger.warn('Falha ao ativar revive', { 
        competitionId, 
        currentLevel 
      }, 'COMPETITION_SCREEN');
    }
  };

  const handleCompleteGame = async () => {
    logger.info('Jogo finalizado', { 
      competitionId, 
      totalScore, 
      currentLevel,
      gameCompleted: true
    }, 'COMPETITION_SCREEN');
    await markParticipationAsCompleted();
    onBack();
  };

  const handleBackToMenu = () => {
    logger.info('Retorno ao menu principal', { 
      competitionId,
      currentLevel,
      totalScore 
    }, 'COMPETITION_SCREEN');
    onBack();
  };

  const handleAdvanceLevelWithReset = () => {
    logger.debug('Avançando nível com reset', { 
      currentLevel,
      nextLevel: currentLevel + 1 
    }, 'COMPETITION_SCREEN');
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

export default CompetitionScreen;
