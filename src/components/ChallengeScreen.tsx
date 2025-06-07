
import React from 'react';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { useChallengeData } from '@/hooks/useChallengeData';
import { useChallengeGameState } from '@/hooks/useChallengeGameState';
import ChallengeCompletedState from './challenge/ChallengeCompletedState';
import ChallengeInstructionsScreen from './challenge/ChallengeInstructionsScreen';
import ChallengeGameScreen from './challenge/ChallengeGameScreen';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const challengeData = useChallengeData(challengeId);
  const {
    currentLevel,
    timeRemaining,
    isGameStarted,
    showInstructions,
    score,
    currentLevelScore,
    completedChallenges,
    setCurrentLevelScore,
    startGame,
    resetToHome,
    advanceLevel,
    stopGame
  } = useChallengeGameState(challengeId);
  
  const { 
    saveLevelProgress
  } = useLevelProgression(challengeId);

  const isChallengeCompleted = completedChallenges.has(challengeId);

  const handleWordFound = (word: string, points: number) => {
    setCurrentLevelScore(prev => prev + points);
  };

  const handleLevelComplete = async (levelScore: number) => {
    console.log(`Nível ${currentLevel} completado com ${levelScore} pontos!`);
    await saveLevelProgress(currentLevel, levelScore);
  };

  const handleAdvanceLevel = () => {
    const isCompleted = advanceLevel();
    if (isCompleted) {
      handleStopGame();
    }
  };

  const handleStopGame = () => {
    console.log(`Usuário parou no desafio ${challengeId} - marcando como concluído`);
    stopGame();
    handleBackToHome();
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  const handleBackToHome = () => {
    console.log(`Voltando para tela inicial - desafio ${challengeId} marcado como concluído`);
    resetToHome();
    onBack();
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
      onBack={handleBackToHome}
      onWordFound={handleWordFound}
      onTimeUp={handleTimeUp}
      onLevelComplete={handleLevelComplete}
      onAdvanceLevel={handleAdvanceLevel}
      onStopGame={handleStopGame}
    />
  );
};

export default ChallengeScreen;
