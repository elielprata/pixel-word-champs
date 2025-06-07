
import { useState, useEffect, useCallback } from 'react';
import { useGamePointsConfig } from './useGamePointsConfig';

export const useGameTimer = (initialTime: number, isGameStarted: boolean) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const { config } = useGamePointsConfig();

  // Reset timer when game starts or level changes
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  // Timer countdown
  useEffect(() => {
    if (isGameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, timeRemaining]);

  const extendTime = useCallback(() => {
    console.log(`Adicionando ${config.revive_time_bonus} segundos ao tempo restante`);
    setTimeRemaining(prev => prev + config.revive_time_bonus);
    return true;
  }, [config.revive_time_bonus]);

  return {
    timeRemaining,
    extendTime,
    canRevive: true // Sempre pode usar revive
  };
};
