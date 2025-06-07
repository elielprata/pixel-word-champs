
import React from 'react';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { useChallengeData } from '@/hooks/useChallengeData';
import { useChallengeGameState } from '@/hooks/useChallengeGameState';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import ChallengeCompletedState from './challenge/ChallengeCompletedState';
import ChallengeInstructionsScreen from './challenge/ChallengeInstructionsScreen';
import ChallengeGameScreen from './challenge/ChallengeGameScreen';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const challengeData = useChallengeData(challengeId);
  const { progress, completeChallenge } = useChallengeProgress();
  const {
    currentLevel,
    timeRemaining,
    isGameStarted,
    showInstructions,
    score,
    currentLevelScore,
    completedLevelsScore,
    completedChallenges,
    canRevive,
    setCurrentLevelScore,
    startGame,
    resetToHome,
    advanceLevel,
    stopGame,
    handleRevive
  } = useChallengeGameState(challengeId);
  
  const { 
    saveLevelProgress
  } = useLevelProgression(challengeId);

  const challengeProgress = progress[challengeId];
  const isChallengeCompleted = challengeProgress?.is_completed || false;

  const handleWordFound = (word: string, points: number) => {
    console.log(`Palavra encontrada: ${word} = ${points} pontos (configuração do painel admin)`);
    setCurrentLevelScore(prev => prev + points);
  };

  const handleLevelComplete = async (levelScore: number) => {
    console.log(`Nível ${currentLevel} completado com ${levelScore} pontos! (usando sistema de pontos do painel admin)`);
    console.log(`Salvando apenas os pontos deste nível completado: ${levelScore} pontos`);
    await saveLevelProgress(currentLevel, levelScore);
  };

  const handleAdvanceLevel = () => {
    const isCompleted = advanceLevel();
    if (isCompleted) {
      handleStopGame();
    }
  };

  const handleStopGame = async () => {
    console.log(`Usuário parou no desafio ${challengeId} - competição sendo marcada como concluída`);
    console.log(`Apenas níveis completados foram contabilizados: ${completedLevelsScore} pontos`);
    const isCompleted = stopGame();
    if (isCompleted) {
      console.log(`Desafio ${challengeId} marcado como concluído - usuário não pode mais jogar esta competição`);
      await completeChallenge(challengeId);
      handleBackToHome();
    }
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado! Pontos do nível atual não serão contabilizados (nível incompleto)');
  };

  const handleBackToHome = () => {
    console.log(`Voltando para tela inicial - desafio ${challengeId} ${isChallengeCompleted ? 'já está' : 'foi'} marcado como concluído`);
    resetToHome();
    onBack();
  };

  const handleReviveClick = () => {
    const success = handleRevive();
    if (success) {
      console.log('Revive ativado com sucesso! Tempo estendido usando configuração do painel admin.');
    } else {
      console.log('Revive não disponível - já foi usado neste nível.');
    }
  };

  if (isChallengeCompleted) {
    return <ChallengeCompletedState onBack={handleBackToHome} />;
  }

  if (showInstructions) {
    return (
      <ChallengeInstructionsScreen
        challengeData={challengeData}
        onBack={handleBackToHome}
        onStart={startGame}
      />
    );
  }

  return (
    <ChallengeGameScreen
      currentLevel={currentLevel}
      timeRemaining={timeRemaining}
      score={score}
      canRevive={canRevive}
      onBack={handleBackToHome}
      onWordFound={handleWordFound}
      onTimeUp={handleTimeUp}
      onLevelComplete={handleLevelComplete}
      onAdvanceLevel={handleAdvanceLevel}
      onStopGame={handleStopGame}
      onRevive={handleReviveClick}
    />
  );
};

export default ChallengeScreen;
