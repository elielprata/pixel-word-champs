
import { useState, useEffect } from 'react';

export const useChallengeGameState = (challengeId: number) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [currentLevelScore, setCurrentLevelScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [isAdvancing, setIsAdvancing] = useState(false);

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
    setIsAdvancing(false);
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
    setIsAdvancing(false);
  };

  const advanceLevel = () => {
    if (isAdvancing) {
      console.log('Already advancing level, ignoring duplicate call');
      return false;
    }

    setIsAdvancing(true);
    
    // Add current level score to total score
    setScore(prev => {
      const newScore = prev + currentLevelScore;
      console.log(`Total score updated: ${prev} + ${currentLevelScore} = ${newScore}`);
      return newScore;
    });
    
    if (currentLevel < 20) {
      const nextLevel = currentLevel + 1;
      console.log(`Advancing from level ${currentLevel} to ${nextLevel}`);
      
      setCurrentLevel(nextLevel);
      setTimeRemaining(180);
      setCurrentLevelScore(0);
      
      // Reset advancing flag after a short delay to allow state updates
      setTimeout(() => {
        setIsAdvancing(false);
      }, 100);
      
      return false;
    } else {
      console.log('Desafio completado! Todos os níveis foram concluídos.');
      setIsAdvancing(false);
      return true; // Indicates challenge completed
    }
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
    isAdvancing,
    setCurrentLevelScore,
    startGame,
    resetToHome,
    advanceLevel,
    stopGame
  };
};
