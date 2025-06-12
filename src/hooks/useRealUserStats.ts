
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RealUserStats {
  totalScore: number;
  gamesPlayed: number;
  weeklyPosition: number | null;
  bestWeeklyPosition: number | null;
  bestDailyPosition: number | null;
  currentStreak: number;
}

export const useRealUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealUserStats>({
    totalScore: 0,
    gamesPlayed: 0,
    weeklyPosition: null,
    bestWeeklyPosition: null,
    bestDailyPosition: null,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserStats = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Carregando estatísticas reais do usuário:', user.id);

      // 1. Buscar dados básicos do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_score, games_played, best_weekly_position, best_daily_position')
        .eq('id', user.id as any)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      // Type-safe access to profile data
      let totalScore = 0;
      let gamesPlayed = 0;
      let bestWeeklyPosition = null;
      let bestDailyPosition = null;

      if (profileData && typeof profileData === 'object' && !('error' in profileData)) {
        totalScore = profileData.total_score || 0;
        gamesPlayed = profileData.games_played || 0;
        bestWeeklyPosition = profileData.best_weekly_position;
        bestDailyPosition = profileData.best_daily_position;
      }

      // 2. Calcular posição no ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      console.log('📅 Semana atual:', weekStartStr);

      const { data: weeklyRankingData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', user.id as any)
        .eq('week_start', weekStartStr as any)
        .maybeSingle();

      if (weeklyError && weeklyError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao buscar posição semanal:', weeklyError);
      }

      let weeklyPosition = null;
      if (weeklyRankingData && typeof weeklyRankingData === 'object' && !('error' in weeklyRankingData)) {
        weeklyPosition = weeklyRankingData.position;
      }

      // 3. Calcular streak atual baseado em sessões recentes
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
        console.warn('⚠️ Erro ao buscar sessões:', sessionsError);
      }

      // Calcular streak contínuo
      let currentStreak = 0;
      const completedDates = new Set(
        (recentSessions || [])
          .filter((session: any) => session && typeof session === 'object' && !('error' in session))
          .map((session: any) => new Date(session.completed_at).toDateString())
      );

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        if (completedDates.has(checkDate.toDateString())) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }

      // 4. Buscar melhor posição histórica caso não exista no perfil
      if (!bestWeeklyPosition) {
        const { data: historicalBest, error: histError } = await supabase
          .from('weekly_rankings')
          .select('position')
          .eq('user_id', user.id as any)
          .order('position', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!histError && historicalBest && typeof historicalBest === 'object' && !('error' in historicalBest)) {
          bestWeeklyPosition = historicalBest.position;
        }
      }

      const userStats: RealUserStats = {
        totalScore,
        gamesPlayed,
        weeklyPosition,
        bestWeeklyPosition,
        bestDailyPosition,
        currentStreak,
      };

      console.log('✅ Estatísticas reais carregadas:', userStats);
      setStats(userStats);

    } catch (err) {
      console.error('❌ Erro ao carregar estatísticas reais:', err);
      setError('Erro ao carregar estatísticas do usuário');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar dados quando o usuário muda
  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  // Monitorar mudanças na tabela weekly_rankings em tempo real
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-rankings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_rankings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Mudança no ranking detectada:', payload);
          loadUserStats(); // Recarregar stats quando há mudança no ranking
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Monitorar mudanças no perfil do usuário
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Mudança no perfil detectada:', payload);
          loadUserStats(); // Recarregar stats quando há mudança no perfil
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    stats,
    isLoading,
    error,
    refetch: loadUserStats
  };
};
