
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  newUsersToday: number;
  sessionsToday: number;
  retentionD1: number;
  retentionD3: number;
  retentionD7: number;
  averageScore: number;
  totalGamesPlayed: number;
  totalAdmins: number;
}

export const useRealUserStats = () => {
  return useQuery({
    queryKey: ['realUserStats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('🔍 Buscando estatísticas reais do sistema...');

      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar usuários ativos únicos (últimas 24h - 00:00:00 a 23:59:59 de hoje)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const { data: activeUsersData } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact' })
        .gte('started_at', today.toISOString())
        .lte('started_at', endOfToday.toISOString());

      // Contar usuários únicos ativos
      const uniqueActiveUsers = new Set(activeUsersData?.map(session => session.user_id) || []);
      const activeUsers = uniqueActiveUsers.size;

      // Buscar total de sessões
      const { count: totalSessions } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true });

      // Usuários criados hoje
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lte('created_at', endOfToday.toISOString());

      // Sessões criadas hoje
      const { count: sessionsToday } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', today.toISOString())
        .lte('started_at', endOfToday.toISOString());

      // Buscar dados agregados dos perfis
      const { data: profileStats } = await supabase
        .from('profiles')
        .select('total_score, games_played');

      const totalGamesPlayed = profileStats?.reduce((sum, profile) => sum + (profile.games_played || 0), 0) || 0;
      const averageScore = profileStats?.length 
        ? profileStats.reduce((sum, profile) => sum + (profile.total_score || 0), 0) / profileStats.length 
        : 0;

      // Buscar total de admins
      const { count: totalAdmins } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Calcular retenção real D1, D3, D7
      const retentionD1 = await calculateRetention(1);
      const retentionD3 = await calculateRetention(3);
      const retentionD7 = await calculateRetention(7);

      return {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalSessions: totalSessions || 0,
        newUsersToday: newUsersToday || 0,
        sessionsToday: sessionsToday || 0,
        retentionD1,
        retentionD3,
        retentionD7,
        averageScore: Math.round(averageScore),
        totalGamesPlayed,
        totalAdmins: totalAdmins || 0,
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    retry: 2,
  });
};

// Função auxiliar para calcular retenção real
async function calculateRetention(days: number): Promise<number> {
  try {
    // Data de referência (hoje - days)
    const referenceDate = new Date();
    referenceDate.setDate(referenceDate.getDate() - days);
    referenceDate.setHours(0, 0, 0, 0);
    
    const endReferenceDate = new Date(referenceDate);
    endReferenceDate.setHours(23, 59, 59, 999);

    // Buscar usuários que se registraram no dia de referência
    const { data: registeredUsers } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', referenceDate.toISOString())
      .lte('created_at', endReferenceDate.toISOString());

    if (!registeredUsers || registeredUsers.length === 0) {
      return 0;
    }

    const registeredUserIds = registeredUsers.map(user => user.id);

    // Data de hoje para verificar atividade
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Buscar quantos desses usuários estiveram ativos hoje
    const { data: activeUsersSessions } = await supabase
      .from('game_sessions')
      .select('user_id')
      .in('user_id', registeredUserIds)
      .gte('started_at', today.toISOString())
      .lte('started_at', endOfToday.toISOString());

    // Contar usuários únicos que retornaram
    const uniqueReturnedUsers = new Set(activeUsersSessions?.map(session => session.user_id) || []);
    const returnedUsers = uniqueReturnedUsers.size;

    // Calcular percentual de retenção
    const retentionRate = (returnedUsers / registeredUsers.length) * 100;
    
    console.log(`📊 Retenção D${days}: ${returnedUsers}/${registeredUsers.length} = ${retentionRate.toFixed(1)}%`);
    
    return Math.round(retentionRate);
  } catch (error) {
    console.error(`❌ Erro ao calcular retenção D${days}:`, error);
    return 0;
  }
}
