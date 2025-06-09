
import { useState, useEffect, useCallback } from 'react';
import { useGamePointsConfig } from './useGamePointsConfig';
import { supabase } from '@/integrations/supabase/client';

interface TimerConfig {
  initialTime: number;
  reviveTimeBonus: number;
}

export const useIntegratedGameTimer = (isGameStarted: boolean) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    initialTime: 180, // fallback padrão
    reviveTimeBonus: 30
  });
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

        let initialTime = 180; // fallback
        
        // Procurar pela configuração base_time_limit
        const timerSetting = timerSettings?.find(s => s.setting_key === 'base_time_limit');
        
        if (timerSetting) {
          initialTime = parseInt(timerSetting.setting_value) || 180;
          console.log(`⏰ Tempo inicial configurado: ${initialTime} segundos (base_time_limit)`);
        } else {
          console.log('⚠️ Configuração base_time_limit não encontrada, usando padrão de 180s');
        }

        setTimerConfig({
          initialTime,
          reviveTimeBonus: config.revive_time_bonus
        });
        setTimeRemaining(initialTime);
      } catch (error) {
        console.error('Erro ao buscar configuração de timer:', error);
        // Usar valores padrão em caso de erro
        setTimerConfig({
          initialTime: 180,
          reviveTimeBonus: config.revive_time_bonus
        });
        setTimeRemaining(180);
      }
    };

    if (!loading) {
      fetchTimerConfig();
    }
  }, [config, loading]);

  // Reset timer when game starts
  useEffect(() => {
    if (isGameStarted) {
      setTimeRemaining(timerConfig.initialTime);
    }
  }, [isGameStarted, timerConfig.initialTime]);

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
    console.log(`Adicionando ${timerConfig.reviveTimeBonus} segundos ao tempo restante`);
    setTimeRemaining(prev => prev + timerConfig.reviveTimeBonus);
    return true;
  }, [timerConfig.reviveTimeBonus]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(timerConfig.initialTime);
  }, [timerConfig.initialTime]);

  return {
    timeRemaining,
    extendTime,
    resetTimer,
    canRevive: true,
    timerConfig
  };
};
