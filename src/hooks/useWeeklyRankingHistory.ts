
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface WeeklyRankingHistoryItem {
  id: string;
  username: string;
  total_score: number;
  position: number;
  prize_amount: number;
}

interface WeekHistoryData {
  week_start: string;
  week_end: string;
  rankings: WeeklyRankingHistoryItem[];
}

export const useWeeklyRankingHistory = (page: number = 1, pageSize: number = 5) => {
  const [historyData, setHistoryData] = useState<WeekHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentWeek, setCurrentWeek] = useState<WeekHistoryData | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calcular offset para paginação
      const offset = (page - 1) * pageSize;

      // Buscar semanas únicas primeiro
      const { data: weeksData, error: weeksError, count } = await supabase
        .from('weekly_rankings')
        .select('week_start, week_end', { count: 'exact' })
        .order('week_start', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (weeksError) throw weeksError;

      // Calcular total de páginas
      const totalWeeks = count || 0;
      setTotalPages(Math.ceil(totalWeeks / pageSize));

      // Buscar dados completos para cada semana
      const historyPromises = (weeksData || []).map(async (week) => {
        const { data: rankings, error: rankingsError } = await supabase
          .from('weekly_rankings')
          .select(`
            id,
            username,
            total_score,
            position,
            prize_amount
          `)
          .eq('week_start', week.week_start)
          .eq('week_end', week.week_end)
          .order('position', { ascending: true });

        if (rankingsError) throw rankingsError;

        return {
          week_start: week.week_start,
          week_end: week.week_end,
          rankings: rankings || []
        };
      });

      const historyResults = await Promise.all(historyPromises);
      setHistoryData(historyResults);

      // Identificar semana atual
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
      const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
      
      const current = historyResults.find(week => week.week_start === currentWeekStartStr);
      setCurrentWeek(current || null);

      secureLogger.debug('Histórico de ranking carregado', { 
        page, 
        totalWeeks, 
        weeksLoaded: historyResults.length 
      }, 'WEEKLY_RANKING_HISTORY');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar histórico';
      setError(errorMessage);
      secureLogger.error('Erro ao carregar histórico do ranking', { error: errorMessage }, 'WEEKLY_RANKING_HISTORY');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, pageSize]);

  return {
    historyData,
    isLoading,
    error,
    totalPages,
    currentWeek,
    refetch: fetchHistory
  };
};
