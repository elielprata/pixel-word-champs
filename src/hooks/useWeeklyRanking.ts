
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

interface WeeklyRankingStats {
  current_week_start: string;
  current_week_end: string;
  total_participants: number;
  total_prize_pool: number;
  last_update: string;
  config?: {
    start_day_of_week: number;
    duration_days: number;
    custom_start_date: string | null;
    custom_end_date: string | null;
  };
  top_3_players: Array<{
    username: string;
    score: number;
    position: number;
    prize: number;
  }>;
}

interface WeeklyRankingUser {
  id: string;
  username: string;
  total_score: number;
  position: number;
  prize_amount: number;
  pix_key?: string;
  pix_holder_name?: string;
}

export const useWeeklyRanking = () => {
  const { toast } = useToast();
  const [currentRanking, setCurrentRanking] = useState<WeeklyRankingUser[]>([]);
  const [stats, setStats] = useState<WeeklyRankingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyRankingStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_weekly_ranking_stats');
      
      if (error) throw error;
      
      // Tratamento seguro da conversão de tipo
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Converter primeiro para unknown, depois para o tipo desejado
        const rawData = data as unknown as WeeklyRankingStats;
        return rawData;
      }
      
      throw new Error('Formato de dados inválido recebido do servidor');
    } catch (error) {
      secureLogger.error('Erro ao buscar estatísticas do ranking', { error }, 'WEEKLY_RANKING');
      throw error;
    }
  };

  const fetchCurrentRanking = async (weekStartStr: string) => {
    try {
      const { data, error } = await supabase
        .from('weekly_rankings')
        .select(`
          id,
          user_id,
          username,
          total_score,
          position,
          prize_amount,
          pix_key,
          pix_holder_name
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      secureLogger.error('Erro ao buscar ranking atual', { error }, 'WEEKLY_RANKING');
      throw error;
    }
  };

  const resetWeeklyScores = async () => {
    try {
      const { error } = await supabase.rpc('reset_weekly_scores_and_positions');
      
      if (error) throw error;
      
      secureLogger.info('Pontuações semanais resetadas manualmente', undefined, 'WEEKLY_RANKING');
    } catch (error) {
      secureLogger.error('Erro ao resetar pontuações', { error }, 'WEEKLY_RANKING');
      throw error;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statsData = await fetchWeeklyRankingStats();
      
      // Converter data para formato adequado para a query
      const weekStartStr = new Date(statsData.current_week_start).toISOString().split('T')[0];
      const rankingData = await fetchCurrentRanking(weekStartStr);

      setStats(statsData);
      setCurrentRanking(rankingData);
      
      secureLogger.debug('Dados do ranking carregados', { 
        participants: statsData.total_participants,
        rankingSize: rankingData.length,
        weekStart: statsData.current_week_start,
        weekEnd: statsData.current_week_end,
        config: statsData.config
      }, 'WEEKLY_RANKING');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar ranking';
      setError(errorMessage);
      secureLogger.error('Erro ao carregar dados do ranking', { error: errorMessage }, 'WEEKLY_RANKING');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    currentRanking,
    stats,
    isLoading,
    error,
    refetch,
    resetWeeklyScores
  };
};
