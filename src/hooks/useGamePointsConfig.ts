
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PointsConfig {
  [key: string]: number;
}

export const useGamePointsConfig = () => {
  const [config, setConfig] = useState<PointsConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('setting_key, setting_value')
          .eq('category', 'scoring')
          .like('setting_key', 'points_per_%_letter_word');

        if (error) throw error;

        const configObj = data.reduce((acc, setting) => {
          acc[setting.setting_key] = parseInt(setting.setting_value);
          return acc;
        }, {} as PointsConfig);

        setConfig(configObj);
      } catch (error) {
        console.error('Erro ao carregar configurações de pontos:', error);
        // Valores padrão em caso de erro
        setConfig({
          'points_per_3_letter_word': 10,
          'points_per_4_letter_word': 20,
          'points_per_5_letter_word': 30,
          'points_per_expert_word': 50
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getPointsForWord = (word: string): number => {
    const length = word.length;
    
    // Primeiro, tentar encontrar configuração exata para o tamanho
    const exactKey = `points_per_${length}_letter_word`;
    if (config[exactKey]) {
      return config[exactKey];
    }
    
    // Se não encontrar configuração exata, usar lógica de fallback
    if (length === 3 && config['points_per_3_letter_word']) {
      return config['points_per_3_letter_word'];
    }
    if (length === 4 && config['points_per_4_letter_word']) {
      return config['points_per_4_letter_word'];
    }
    if (length === 5 && config['points_per_5_letter_word']) {
      return config['points_per_5_letter_word'];
    }
    if (length >= 8 && config['points_per_expert_word']) {
      return config['points_per_expert_word'];
    }
    
    // Fallback para valores padrão se não houver configuração
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
