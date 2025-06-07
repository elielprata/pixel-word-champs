
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  position: number | null;
  totalScore: number;
  gamesPlayed: number;
  winStreak: number;
  bestDailyPosition: number | null;
  bestWeeklyPosition: number | null;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    position: null,
    totalScore: 0,
    gamesPlayed: 0,
    winStreak: 0,
    bestDailyPosition: null,
    bestWeeklyPosition: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar posição no ranking diário
      const { data: dailyRanking, error: dailyError } = await supabase
        .from('daily_rankings')
        .select('position')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (dailyError) throw dailyError;

      // Calcular sequência de vitórias (níveis completados nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Calcular sequência contínua
      let streak = 0;
      const today = new Date().toDateString();
      const completedDates = new Set(
        recentSessions?.map(session => 
          new Date(session.completed_at).toDateString()
        ) || []
      );

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        if (completedDates.has(checkDate.toDateString())) {
          streak++;
        } else if (i > 0) {
          break; // Quebra na primeira data sem atividade (exceto hoje)
        }
      }

      setStats({
        position: dailyRanking?.position || null,
        totalScore: profile?.total_score || 0,
        gamesPlayed: profile?.games_played || 0,
        winStreak: streak,
        bestDailyPosition: profile?.best_daily_position || null,
        bestWeeklyPosition: profile?.best_weekly_position || null
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    refetch: loadUserStats
  };
};
