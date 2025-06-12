
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIntegratedGameTimer = (isGameStarted: boolean = false) => {
  const [timerSettings, setTimerSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // Default 5 minutes

  useEffect(() => {
    const fetchTimerSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'game_timer_duration' as any)
          .eq('category', 'gameplay' as any)
          .maybeSingle();

        if (error) throw error;

        if (data && typeof data === 'object' && !('error' in data)) {
          const setting = data as any;
          if (setting.setting_key && setting.setting_value) {
            const duration = parseInt(setting.setting_value) || 300;
            setTimerSettings({ duration });
            setTimeRemaining(duration);
          }
        } else {
          // Default settings if none found
          const defaultDuration = 300;
          setTimerSettings({ duration: defaultDuration });
          setTimeRemaining(defaultDuration);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do timer:', error);
        const defaultDuration = 300;
        setTimerSettings({ duration: defaultDuration });
        setTimeRemaining(defaultDuration);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimerSettings();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isGameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, timeRemaining]);

  const extendTime = () => {
    const bonusTime = 60; // 1 minute bonus
    setTimeRemaining(prev => prev + bonusTime);
    return true;
  };

  const resetTimer = () => {
    if (timerSettings?.duration) {
      setTimeRemaining(timerSettings.duration);
    }
  };

  return {
    timerSettings,
    isLoading,
    timeRemaining,
    extendTime,
    resetTimer
  };
};
