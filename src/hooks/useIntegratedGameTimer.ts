
import { useState, useEffect, useCallback } from 'react';
import { useGamePointsConfig } from './useGamePointsConfig';
import { supabase } from '@/integrations/supabase/client';

interface TimerConfig {
  initialTime: number;
  reviveTimeBonus: number;
}

interface UseIntegratedGameTimerProps {
  initialTime: number;
  onTimeUp?: () => void;
}

export const useIntegratedGameTimer = ({ initialTime, onTimeUp }: UseIntegratedGameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const { config, loading } = useGamePointsConfig();

  // Configurar timer com base nas configurações do backend
  useEffect(() => {
    const fetchTimerConfig = async () => {
      try {
        // Buscar configuração de tempo base do banco
        const { data: timerSettings, error } = await supabase
          .from('game_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'base_time_limit')
          .eq('category', 'gameplay');

        if (error) throw error;

        let configuredTime = initialTime;
        
        // Procurar pela configuração base_time_limit
        const timerSetting = timerSettings?.find(s => s.setting_key === 'base_time_limit');
        
        if (timerSetting) {
          configuredTime = parseInt(timerSetting.setting_value) || initialTime;
          console.log(`⏰ Tempo inicial configurado: ${configuredTime} segundos (base_time_limit)`);
        } else {
          console.log(`⚠️ Configuração base_time_limit não encontrada, usando padrão de ${initialTime}s`);
        }

        setTimeLeft(configuredTime);
      } catch (error) {
        console.error('Erro ao buscar configuração de timer:', error);
        setTimeLeft(initialTime);
      }
    };

    if (!loading) {
      fetchTimerConfig();
    }
  }, [config, loading, initialTime]);

  // Timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && onTimeUp) {
            onTimeUp();
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft, onTimeUp]);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(false);
  }, [initialTime]);

  const extendTime = useCallback(() => {
    const bonusTime = config?.revive_time_bonus || 30;
    console.log(`⏰ Adicionando ${bonusTime} segundos ao tempo restante`);
    setTimeLeft(prev => prev + bonusTime);
    return true;
  }, [config?.revive_time_bonus]);

  return {
    timeLeft,
    startTimer,
    stopTimer,
    resetTimer,
    extendTime,
    onTimeUp: onTimeUp || (() => {}),
    canRevive: true
  };
};
