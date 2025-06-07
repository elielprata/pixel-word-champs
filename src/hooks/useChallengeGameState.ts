
import { useState, useEffect } from 'react';

export const useChallengeGameState = (challengeId: number) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [currentLevelScore, setCurrentLevelScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());

  // Timer effect
  useEffect(() => {
    if (isGameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, timeRemaining]);

  // Reset to level 1 when component mounts (when entering the challenge)
  useEffect(() => {
    setCurrentLevel(1);
    setScore(0);
    setCurrentLevelScore(0);
    setTimeRemaining(180);
    setIsGameStarted(false);
    setShowInstructions(true);
  }, [challengeId]);

  const startGame = () => {
    setShowInstructions(false);
    setIsGameStarted(true);
    setScore(0);
    setCurrentLevelScore(0);
  };

  const resetToHome = () => {
    setCurrentLevel(1);
    setScore(0);
    setCurrentLevelScore(0);
    setTimeRemaining(180);
    setIsGameStarted(false);
    setShowInstructions(true);
  };

  const advanceLevel = () => {
    setScore(prev => prev + currentLevelScore);
    
    if (currentLevel < 20) {
      setCurrentLevel(prev => prev + 1);
      setTimeRemaining(180);
      setCurrentLevelScore(0);
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      console.log('Desafio completado! Todos os níveis foram concluídos.');
      return true; // Indicates challenge completed
    }
    return false;
  };

  const stopGame = () => {
    setCompletedChallenges(prev => new Set(prev).add(challengeId));
    console.log(`Usuário parou no desafio ${challengeId}`);
    return true;
  };

  return {
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
  };
};
