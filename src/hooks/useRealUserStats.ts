
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
  // Admin dashboard stats
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalAdmins: number;
  averageScore: number;
  totalGamesPlayed: number;
  retentionD1: number;
  retentionD3: number;
  retentionD7: number;
  totalSessions: number;
  sessionsToday: number;
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
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalAdmins: 0,
    averageScore: 0,
    totalGamesPlayed: 0,
    retentionD1: 0,
    retentionD3: 0,
    retentionD7: 0,
    totalSessions: 0,
    sessionsToday: 0,
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

      // 2. Buscar estatísticas gerais para admin dashboard
      const { data: allProfilesData, error: allProfilesError } = await supabase
        .from('profiles')
        .select('total_score, games_played, created_at');

      let totalUsers = 0;
      let averageScore = 0;
      let totalGamesPlayed = 0;
      let newUsersToday = 0;

      if (!allProfilesError && allProfilesData) {
        const validProfiles = allProfilesData.filter((item): item is any => 
          item && typeof item === 'object' && !('error' in item)
        );

        totalUsers = validProfiles.length;
        
        const totalScoreSum = validProfiles.reduce((sum, profile) => sum + (profile.total_score || 0), 0);
        averageScore = totalUsers > 0 ? Math.round(totalScoreSum / totalUsers) : 0;
        
        totalGamesPlayed = validProfiles.reduce((sum, profile) => sum + (profile.games_played || 0), 0);
        
        const today = new Date().toDateString();
        newUsersToday = validProfiles.filter(profile => 
          new Date(profile.created_at).toDateString() === today
        ).length;
      }

      // 3. Buscar contagem de admins
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      let totalAdmins = 0;
      if (!adminError && adminData) {
        totalAdmins = adminData.filter((item): item is any => 
          item && typeof item === 'object' && !('error' in item)
        ).length;
      }

      // 4. Calcular posição no ranking semanal atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: weeklyRankingData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .eq('user_id', user.id as any)
        .eq('week_start', weekStartStr as any)
        .maybeSingle();

      let weeklyPosition = null;
      if (!weeklyError && weeklyRankingData && typeof weeklyRankingData === 'object' && !('error' in weeklyRankingData)) {
        weeklyPosition = weeklyRankingData.position;
      }

      // 5. Calcular streak atual baseado em sessões recentes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('completed_at, is_completed')
        .eq('user_id', user.id as any)
        .eq('is_completed', true as any)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      let currentStreak = 0;
      let totalSessions = 0;
      let sessionsToday = 0;

      if (!sessionsError && recentSessions) {
        const validSessions = recentSessions.filter((session: any) => 
          session && typeof session === 'object' && !('error' in session)
        );

        totalSessions = validSessions.length;
        
        const todayStr = new Date().toDateString();
        sessionsToday = validSessions.filter((session: any) => 
          new Date(session.completed_at).toDateString() === todayStr
        ).length;

        // Calcular streak contínuo
        const completedDates = new Set(
          validSessions.map((session: any) => new Date(session.completed_at).toDateString())
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
      }

      // 6. Buscar melhor posição histórica caso não exista no perfil
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
        totalUsers,
        activeUsers: Math.round(totalUsers * 0.3), // Estimativa de usuários ativos
        newUsersToday,
        totalAdmins,
        averageScore,
        totalGamesPlayed,
        retentionD1: 75, // Valores mockados para métricas de retenção
        retentionD3: 60,
        retentionD7: 45,
        totalSessions,
        sessionsToday,
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
          loadUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
          loadUserStats();
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
