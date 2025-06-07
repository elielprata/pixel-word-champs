
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalAdmins: number;
  averageScore: number;
  totalGamesPlayed: number;
  retentionD1: number;
  retentionD3: number;
  retentionD7: number;
  isLoading: boolean;
}

export const useRealUserStats = () => {
  const [stats, setStats] = useState<RealUserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalAdmins: 0,
    averageScore: 0,
    totalGamesPlayed: 0,
    retentionD1: 0,
    retentionD3: 0,
    retentionD7: 0,
    isLoading: true
  });

  useEffect(() => {
    loadRealStats();
  }, []);

  const calculateRetention = async (daysAgo: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Usuários que se registraram no dia alvo
    const { data: usersRegistered, error: registeredError } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', targetDate.toISOString())
      .lt('created_at', nextDay.toISOString());

    if (registeredError) throw registeredError;

    if (!usersRegistered || usersRegistered.length === 0) {
      return 0;
    }

    // Verificar quantos desses usuários jogaram hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: activeSessions, error: activeError } = await supabase
      .from('game_sessions')
      .select('user_id')
      .gte('started_at', today.toISOString())
      .in('user_id', usersRegistered.map(u => u.id));

    if (activeError) throw activeError;

    const uniqueActiveUsers = new Set(activeSessions?.map(session => session.user_id) || []);
    
    const retention = (uniqueActiveUsers.size / usersRegistered.length) * 100;
    return Math.min(retention, 100); // Limitar a 100%
  };

  const loadRealStats = async () => {
    try {
      console.log('🔍 Carregando estatísticas reais dos usuários...');

      // Total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Usuários ativos (usuários únicos que jogaram nas últimas 24h)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: activeSessions, error: activeError } = await supabase
        .from('game_sessions')
        .select('user_id')
        .gte('started_at', twentyFourHoursAgo.toISOString());

      if (activeError) throw activeError;

      // Contar usuários únicos que jogaram
      const uniqueActiveUsers = new Set(activeSessions?.map(session => session.user_id) || []);
      const activeUsers = uniqueActiveUsers.size;

      // Novos usuários hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: newUsersToday, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (newUsersError) throw newUsersError;

      // Total de administradores
      const { count: totalAdmins, error: adminsError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminsError) throw adminsError;

      // Pontuação média e total de jogos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('total_score, games_played');

      if (profilesError) throw profilesError;

      const validProfiles = profilesData?.filter(p => p.total_score > 0) || [];
      const averageScore = validProfiles.length > 0 
        ? Math.round(validProfiles.reduce((sum, p) => sum + (p.total_score || 0), 0) / validProfiles.length)
        : 0;

      const totalGamesPlayed = profilesData?.reduce((sum, p) => sum + (p.games_played || 0), 0) || 0;

      // Calcular retenções D1, D3 e D7
      const [retentionD1, retentionD3, retentionD7] = await Promise.all([
        calculateRetention(1),
        calculateRetention(3),
        calculateRetention(7)
      ]);

      const realStats = {
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsersToday: newUsersToday || 0,
        totalAdmins: totalAdmins || 0,
        averageScore,
        totalGamesPlayed,
        retentionD1: Math.round(retentionD1),
        retentionD3: Math.round(retentionD3),
        retentionD7: Math.round(retentionD7),
        isLoading: false
      };

      console.log('📊 Estatísticas reais carregadas:', realStats);
      console.log(`👥 Usuários únicos ativos nas últimas 24h: ${activeUsers} (de ${activeSessions?.length || 0} sessões)`);
      console.log(`📈 Retenção - D1: ${retentionD1}%, D3: ${retentionD3}%, D7: ${retentionD7}%`);
      setStats(realStats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas reais:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return { stats, refetch: loadRealStats };
};
