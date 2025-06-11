
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
          .eq('category', 'scoring');

        if (error) throw error;

        const configObj = data.reduce((acc, setting) => {
          acc[setting.setting_key] = parseInt(setting.setting_value);
          return acc;
        }, {} as PointsConfig);

        logger.log('🎯 Configurações de pontuação carregadas:', configObj);
        setConfig(configObj);
      } catch (error) {
        logger.error('Erro ao carregar configurações de pontos:', error);
        // Valores padrão em caso de erro
        setConfig({
          'points_per_3_to_5_letter_word': 30,
          'points_per_6_to_8_letter_word': 60,
          'points_per_8_to_10_letter_word': 100,
          'points_per_11_to_20_letter_word': 150
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getPointsForWord = (word: string): number => {
    const length = word.length;
    
    logger.log(`🔢 Calculando pontos para palavra "${word}" (${length} letras)`);
    
    // Verificar as faixas de pontuação do banco de dados
    if (length >= 3 && length <= 5 && config['points_per_3_to_5_letter_word']) {
      logger.log(`✅ Palavra ${word} (${length} letras) = ${config['points_per_3_to_5_letter_word']} pontos (faixa 3-5)`);
      return config['points_per_3_to_5_letter_word'];
    }
    
    if (length >= 6 && length <= 8 && config['points_per_6_to_8_letter_word']) {
      logger.log(`✅ Palavra ${word} (${length} letras) = ${config['points_per_6_to_8_letter_word']} pontos (faixa 6-8)`);
      return config['points_per_6_to_8_letter_word'];
    }
    
    if (length >= 8 && length <= 10 && config['points_per_8_to_10_letter_word']) {
      logger.log(`✅ Palavra ${word} (${length} letras) = ${config['points_per_8_to_10_letter_word']} pontos (faixa 8-10)`);
      return config['points_per_8_to_10_letter_word'];
    }
    
    if (length >= 11 && length <= 20 && config['points_per_11_to_20_letter_word']) {
      logger.log(`✅ Palavra ${word} (${length} letras) = ${config['points_per_11_to_20_letter_word']} pontos (faixa 11-20)`);
      return config['points_per_11_to_20_letter_word'];
    }
    
    // Fallback para valores padrão se não houver configuração específica
    if (length >= 3 && length <= 5) {
      logger.log(`⚠️ Palavra ${word} (${length} letras) = 30 pontos (fallback 3-5)`);
      return 30;
    }
    if (length >= 6 && length <= 8) {
      logger.log(`⚠️ Palavra ${word} (${length} letras) = 60 pontos (fallback 6-8)`);
      return 60;
    }
    if (length >= 9 && length <= 10) {
      logger.log(`⚠️ Palavra ${word} (${length} letras) = 100 pontos (fallback 9-10)`);
      return 100;
    }
    if (length >= 11) {
      logger.log(`⚠️ Palavra ${word} (${length} letras) = 150 pontos (fallback 11+)`);
      return 150;
    }
    
    logger.log(`❌ Palavra ${word} (${length} letras) = 0 pontos (inválida)`);
    return 0;
  };

  return {
    config,
    loading,
    getPointsForWord
  };
};
