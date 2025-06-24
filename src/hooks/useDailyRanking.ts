
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface DailyRankingUser {
  user_id: string;
  name: string;
  avatar_url?: string;
  score: number;
  pos: number;
}

export const useDailyRanking = () => {
  const [dailyRanking, setDailyRanking] = useState<DailyRankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current week's ranking from weekly_rankings table
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          user_id,
          username,
          total_score,
          position,
          profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (error) throw error;

      const formattedData: DailyRankingUser[] = (data || []).map(item => ({
        user_id: item.user_id,
        name: item.profiles?.full_name || item.username || 'Usuário',
        avatar_url: item.profiles?.avatar_url || undefined,
        score: item.total_score || 0,
        pos: item.position || 0
      }));

      setDailyRanking(formattedData);
      secureLogger.debug('Daily ranking carregado', { count: formattedData.length }, 'DAILY_RANKING');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar ranking';
      setError(errorMessage);
      secureLogger.error('Erro ao carregar daily ranking', { error: errorMessage }, 'DAILY_RANKING');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyRanking();
  }, []);

  return {
    dailyRanking,
    isLoading,
    error,
    refetch: fetchDailyRanking
  };
};
