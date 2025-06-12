
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIntegratedGameTimer = () => {
  const [timerSettings, setTimerSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            setTimerSettings({
              duration: parseInt(setting.setting_value) || 300 // Default 5 minutes
            });
          }
        } else {
          // Default settings if none found
          setTimerSettings({ duration: 300 });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do timer:', error);
        setTimerSettings({ duration: 300 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimerSettings();
  }, []);

  return {
    timerSettings,
    isLoading
  };
};
