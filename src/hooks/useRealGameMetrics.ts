
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealGameMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['gameMetrics'],
    queryFn: async () => {
      console.log('🔍 Buscando métricas do sistema...');
      
      // Buscar total de palavras ativas
      const { data: wordsData, error: wordsError } = await supabase
        .from('level_words')
        .select('id, word, level, category, difficulty')
        .eq('is_active', true);

      if (wordsError) {
        console.error('❌ Erro ao buscar palavras:', wordsError);
        throw wordsError;
      }

      console.log('📝 Palavras encontradas:', wordsData?.length, wordsData);

      // Buscar total de categorias ativas
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('word_categories')
        .select('id, name')
        .eq('is_active', true);

      if (categoriesError) {
        console.error('❌ Erro ao buscar categorias:', categoriesError);
        throw categoriesError;
      }

      console.log('📋 Categorias encontradas:', categoriesData?.length, categoriesData);

      const result = {
        activeWords: wordsData?.length || 0,
        activeCategories: categoriesData?.length || 0
      };

      console.log('📊 Métricas finais:', result);
      return result;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    metrics: metrics || { activeWords: 0, activeCategories: 0 },
    isLoading
  };
};
