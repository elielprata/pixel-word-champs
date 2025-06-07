
import { useState, useEffect, useCallback } from 'react';
import { useGamePointsConfig } from './useGamePointsConfig';

export const useGameTimer = (initialTime: number, isGameStarted: boolean) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [hasRevived, setHasRevived] = useState(false);
  const { config } = useGamePointsConfig();

  // Reset timer when game starts or level changes
  useEffect(() => {
    setTimeRemaining(initialTime);
    setHasRevived(false);
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
    if (!hasRevived) {
      console.log(`Adicionando ${config.revive_time_bonus} segundos ao tempo restante`);
      setTimeRemaining(prev => prev + config.revive_time_bonus);
      setHasRevived(true);
      return true;
    }
    return false;
  }, [hasRevived, config.revive_time_bonus]);

  return {
    timeRemaining,
    hasRevived,
    extendTime,
    canRevive: !hasRevived
  };
};
