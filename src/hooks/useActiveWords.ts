
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActiveWord {
  id: string;
  word: string;
  level: number;
  category: string | null;
  difficulty: string;
  created_at: string;
  updated_at: string;
}

export const useActiveWords = () => {
  const { data: words = [], isLoading, refetch } = useQuery({
    queryKey: ['activeWords'],
    queryFn: async (): Promise<ActiveWord[]> => {
      console.log('🔍 Buscando palavras ativas...');
      
      const { data, error } = await supabase
        .from('level_words')
        .select('id, word, level, category, difficulty, created_at, updated_at')
        .eq('is_active', true)
        .order('word');

      if (error) {
        console.error('❌ Erro ao buscar palavras:', error);
        throw error;
      }

      console.log('📝 Palavras ativas encontradas:', data?.length);
      return data || [];
    },
  });

  return {
    words,
    isLoading,
    refetch
  };
};

export type { ActiveWord };
