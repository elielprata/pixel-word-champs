
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PointsConfig {
  [key: string]: number;
  revive_time_bonus: number;
}

export const useGamePointsConfig = () => {
  const [config, setConfig] = useState<PointsConfig>({
    revive_time_bonus: 30
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('setting_key, setting_value')
          .eq('category', 'scoring');

        if (error) throw error;

        const configObj = data.reduce((acc, setting) => {
          acc[setting.setting_key] = parseInt(setting.setting_value);
          return acc;
        }, {} as PointsConfig);

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
    
    // Buscar configuração específica para o tamanho da palavra
    const specificKey = `points_per_${length}_letter_word`;
    if (config[specificKey] !== undefined) {
      return config[specificKey];
    }

    // Fallback para configurações antigas ou padrão
    if (length === 3 && config.points_per_3_letter_word) return config.points_per_3_letter_word;
    if (length === 4 && config.points_per_4_letter_word) return config.points_per_4_letter_word;
    if (length === 5 && config.points_per_5_letter_word) return config.points_per_5_letter_word;
    if (length >= 6 && config.points_per_expert_word) return config.points_per_expert_word;

    // Fallback padrão baseado no tamanho
    if (length === 3) return 10;
    if (length === 4) return 20;
    if (length === 5) return 30;
    if (length >= 6) return 50;
    
    return 0;
  };

  return {
    config,
    loading,
    getPointsForWord
  };
};
