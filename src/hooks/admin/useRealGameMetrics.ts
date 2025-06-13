
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useRealGameMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['gameMetrics'],
    queryFn: async () => {
      logger.debug('Buscando métricas do sistema', undefined, 'GAME_METRICS');
      
      // Buscar total de palavras ativas
      const { data: wordsData, error: wordsError } = await supabase
        .from('level_words')
        .select('id, word, level, category, difficulty')
        .eq('is_active', true);

      if (wordsError) {
        logger.error('Erro ao buscar palavras', { error: wordsError.message }, 'GAME_METRICS');
        throw wordsError;
      }

      logger.debug('Palavras encontradas', { count: wordsData?.length }, 'GAME_METRICS');

      // Buscar total de categorias ativas
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('word_categories')
        .select('id, name')
        .eq('is_active', true);

      if (categoriesError) {
        logger.error('Erro ao buscar categorias', { error: categoriesError.message }, 'GAME_METRICS');
        throw categoriesError;
      }

      logger.debug('Categorias encontradas', { count: categoriesData?.length }, 'GAME_METRICS');

      const result = {
        activeWords: wordsData?.length || 0,
        activeCategories: categoriesData?.length || 0
      };

      logger.info('Métricas carregadas', result, 'GAME_METRICS');
      return result;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    metrics: metrics || { activeWords: 0, activeCategories: 0 },
    isLoading
  };
};
