
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
      console.log('📊 Carregando estatísticas do usuário:', user.id);

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id as any)
        .single();

      if (profileError) throw profileError;

      // Buscar posição no ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRanking, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', user.id as any)
        .eq('week_start', weekStartStr as any)
        .maybeSingle();

      if (weeklyError && weeklyError.code !== 'PGRST116') {
        console.warn('Erro ao buscar ranking semanal:', weeklyError);
      }

      // Calcular sequência de vitórias baseada em jogos completados recentemente
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('completed_at, is_completed')
        .eq('user_id', user.id as any)
        .eq('is_completed', true as any)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (sessionsError) {
        console.warn('Erro ao buscar sessões:', sessionsError);
      }

      // Calcular sequência contínua de dias com jogos
      let streak = 0;
      const completedDates = new Set(
        (recentSessions || [])
          .filter((session: any) => session && typeof session === 'object' && !('error' in session))
          .map((session: any) => new Date(session.completed_at).toDateString())
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

      const userStats = {
        position: (weeklyRanking && typeof weeklyRanking === 'object' && !('error' in weeklyRanking)) ? weeklyRanking.position : null,
        totalScore: (profile && typeof profile === 'object' && !('error' in profile)) ? profile.total_score || 0 : 0,
        gamesPlayed: (profile && typeof profile === 'object' && !('error' in profile)) ? profile.games_played || 0 : 0,
        winStreak: streak,
        bestDailyPosition: (profile && typeof profile === 'object' && !('error' in profile)) ? profile.best_daily_position : null,
        bestWeeklyPosition: (profile && typeof profile === 'object' && !('error' in profile)) ? profile.best_weekly_position : null
      };

      console.log('📊 Estatísticas do usuário carregadas:', userStats);
      setStats(userStats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas do usuário:', error);
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
