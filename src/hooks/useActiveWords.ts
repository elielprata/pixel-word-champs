
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Word {
  id: string;
  word: string;
  level: number;
  difficulty: string;
  category: string | null;
  is_active: boolean;
}

export const useActiveWords = () => {
  return useQuery({
    queryKey: ['activeWords'],
    queryFn: async (): Promise<Word[]> => {
      console.log('🔍 Buscando palavras ativas...');
      
      const { data, error } = await supabase
        .from('level_words')
        .select('*')
        .eq('is_active', true as any)
        .order('level', { ascending: true })
        .order('word', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar palavras ativas:', error);
        throw error;
      }

      // Validar e filtrar dados
      const validWords = (data || [])
        .filter((word: any) => word && typeof word === 'object' && !('error' in word))
        .map((word: any) => ({
          id: word.id,
          word: word.word || '',
          level: word.level || 1,
          difficulty: word.difficulty || 'medium',
          category: word.category,
          is_active: Boolean(word.is_active)
        }));

      console.log(`✅ ${validWords.length} palavras ativas encontradas`);
      return validWords;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useWordsByLevel = (level: number) => {
  return useQuery({
    queryKey: ['wordsByLevel', level],
    queryFn: async (): Promise<Word[]> => {
      console.log(`🔍 Buscando palavras do nível ${level}...`);
      
      const { data, error } = await supabase
        .from('level_words')
        .select('*')
        .eq('level', level as any)
        .eq('is_active', true as any)
        .order('word', { ascending: true });

      if (error) {
        console.error(`❌ Erro ao buscar palavras do nível ${level}:`, error);
        throw error;
      }

      // Validar e filtrar dados
      const validWords = (data || [])
        .filter((word: any) => word && typeof word === 'object' && !('error' in word))
        .map((word: any) => ({
          id: word.id,
          word: word.word || '',
          level: word.level || level,
          difficulty: word.difficulty || 'medium',
          category: word.category,
          is_active: Boolean(word.is_active)
        }));

      console.log(`✅ ${validWords.length} palavras encontradas para o nível ${level}`);
      return validWords;
    },
    enabled: level > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
