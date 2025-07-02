
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyRankingStats {
  current_week_start: string | null;
  current_week_end: string | null;
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
    status: string;
  } | null;
  no_active_competition?: boolean;
  competition_status?: string;
  message?: string;
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

      // Converter Json para WeeklyRankingStats usando unknown primeiro
      const convertedStats = statsData as unknown as WeeklyRankingStats;
      setStats(convertedStats);

      // Carregar ranking atual se houver configuração
      if (convertedStats && convertedStats.current_week_start && !convertedStats.no_active_competition) {
        // Tentar usar a função segura primeiro
        try {
          const { data: secureRankingData, error: secureError } = await supabase
            .rpc('get_current_weekly_ranking');
          
          if (secureError) {
            throw secureError;
          }
          
          if (secureRankingData && secureRankingData.length > 0) {
            // Mapear os dados da função segura
            const mappedRanking = secureRankingData.map((item: any) => ({
              id: `${item.user_id}-${item.week_start}`, // ID sintético
              user_id: item.user_id,
              username: item.username,
              position: item.position,
              total_score: item.total_score,
              prize_amount: 0, // Será calculado separadamente se necessário
              payment_status: 'not_eligible',
              pix_key: undefined,
              pix_holder_name: undefined
            }));
            
            setCurrentRanking(mappedRanking);
          } else {
            // Fallback para weekly_rankings se a função não retornar dados
            const { data: rankingData, error: rankingError } = await supabase
              .from('weekly_rankings')
              .select('*')
              .eq('week_start', convertedStats.current_week_start)
              .order('position', { ascending: true });

            if (rankingError) {
              throw rankingError;
            }

            setCurrentRanking(rankingData || []);
          }
        } catch (err) {
          // Em caso de erro com a função segura, usar weekly_rankings
          console.warn('Erro ao usar função segura, usando fallback:', err);
          
          const { data: rankingData, error: rankingError } = await supabase
            .from('weekly_rankings')
            .select('*')
            .eq('week_start', convertedStats.current_week_start)
            .order('position', { ascending: true });

          if (rankingError) {
            throw rankingError;
          }

          setCurrentRanking(rankingData || []);
        }
      } else {
        // Se não há competição ativa, limpar ranking
        setCurrentRanking([]);
      }

    } catch (err: any) {
      console.error('Erro ao carregar ranking semanal:', err);
      setError(err.message || 'Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
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
    refetch: loadWeeklyRanking
  };
};
