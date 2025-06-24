
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
          position
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      if (error) throw error;

      // Get profile data separately to avoid join issues
      const userIds = (data || []).map(item => item.user_id);
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        
        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      const formattedData: DailyRankingUser[] = (data || []).map(item => {
        const profile = profilesData.find(p => p.id === item.user_id);
        return {
          user_id: item.user_id,
          name: profile?.username || item.username || 'Usuário',
          avatar_url: profile?.avatar_url || undefined,
          score: item.total_score || 0,
          pos: item.position || 0
        };
      });

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
