
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyRankingStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  top_3_players: Array<{
    username: string;
    score: number;
    position: number;
    prize: number;
  }>;
  config: {
    start_date: string;
    end_date: string;
  };
}

interface WeeklyRankingEntry {
  id: string;
  user_id: string;
  username: string;
  position: number;
  total_score: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
  pix_holder_name?: string;
}

export const useWeeklyRanking = () => {
  const [stats, setStats] = useState<WeeklyRankingStats | null>(null);
  const [currentRanking, setCurrentRanking] = useState<WeeklyRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar estatísticas usando a função do banco
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_weekly_ranking_stats');

      if (statsError) {
        throw statsError;
      }

      if (statsData && typeof statsData === 'object' && 'error' in statsData) {
        throw new Error(statsData.error as string);
      }

      setStats(statsData as WeeklyRankingStats);

      // Carregar ranking atual
      if (statsData && typeof statsData === 'object' && 'current_week_start' in statsData) {
        const { data: rankingData, error: rankingError } = await supabase
          .from('weekly_rankings')
          .select('*')
          .eq('week_start', (statsData as any).current_week_start)
          .order('position', { ascending: true });

        if (rankingError) {
          throw rankingError;
        }

        setCurrentRanking(rankingData || []);
      } else {
        setCurrentRanking([]);
      }

    } catch (err: any) {
      console.error('Erro ao carregar ranking semanal:', err);
      setError(err.message || 'Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRanking = async () => {
    try {
      const { error } = await supabase.rpc('update_weekly_ranking');
      if (error) throw error;
      
      // Recarregar dados após atualização
      await loadWeeklyRanking();
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao atualizar ranking:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadWeeklyRanking();
  }, []);

  return {
    stats,
    currentRanking,
    isLoading,
    error,
    refetch: loadWeeklyRanking,
    updateRanking
  };
};
