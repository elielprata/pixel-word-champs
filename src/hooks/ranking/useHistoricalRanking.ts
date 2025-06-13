import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalRankingEntry {
  week_start: string;
  position: number;
  total_score: number;
}

export const useHistoricalRanking = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['historicalRanking', user?.id],
    queryFn: async (): Promise<HistoricalRankingEntry[]> => {
      if (!user?.id) {
        console.warn('Sem user ID para buscar ranking histórico');
        return [];
      }

      console.log('Buscando ranking histórico do usuário:', user.id);

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('week_start, position, total_score')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ranking histórico:', error);
        throw error;
      }

      console.log('Ranking histórico encontrado:', data.length, 'semanas');
      return data || [];
    },
    enabled: !!user?.id,
  });
};

