
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PointsConfig {
  points_per_3_letter_word: number;
  points_per_4_letter_word: number;
  points_per_5_letter_word: number;
  points_per_expert_word: number;
  revive_time_bonus: number;
}

export const useGamePointsConfig = () => {
  const [config, setConfig] = useState<PointsConfig>({
    points_per_3_letter_word: 10,
    points_per_4_letter_word: 20,
    points_per_5_letter_word: 30,
    points_per_expert_word: 50,
    revive_time_bonus: 30
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('setting_key, setting_value')
          .in('setting_key', [
            'points_per_3_letter_word',
            'points_per_4_letter_word', 
            'points_per_5_letter_word',
            'points_per_expert_word',
            'revive_time_bonus'
          ]);

        if (error) throw error;

        const configObj = data.reduce((acc, setting) => {
          acc[setting.setting_key as keyof PointsConfig] = parseInt(setting.setting_value);
          return acc;
        }, {} as Partial<PointsConfig>);

        setConfig(prev => ({ ...prev, ...configObj }));
      } catch (error) {
        console.error('Erro ao carregar configurações de pontos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getPointsForWord = (word: string): number => {
    const length = word.length;
    if (length === 3) return config.points_per_3_letter_word;
    if (length === 4) return config.points_per_4_letter_word;
    if (length === 5) return config.points_per_5_letter_word;
    if (length >= 6) return config.points_per_expert_word;
    return 0;
  };

  return {
    config,
    loading,
    getPointsForWord
  };
};
