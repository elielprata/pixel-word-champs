
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveWords = () => {
  const { data: words, isLoading, error, refetch } = useQuery({
    queryKey: ['activeWords'],
    queryFn: async () => {
      console.log('🔍 Buscando palavras ativas...');
      
      const { data, error } = await supabase
        .from('level_words')
        .select('id, word, category, difficulty, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar palavras:', error);
        throw error;
      }

      console.log('📝 Palavras ativas encontradas:', data?.length, data);
      return data || [];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    words: words || [],
    isLoading,
    error,
    refetch,
  };
};
