
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

      // Buscar usuários ativos (últimas 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { count: activeUsers } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', oneDayAgo.toISOString());

      // Buscar total de sessões
      const { count: totalSessions } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true });

      // Usuários criados hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Sessões criadas hoje
      const { count: sessionsToday } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', today.toISOString());

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

      // Calcular retenção (simulada baseada em dados disponíveis)
      const retentionD1 = totalUsers && activeUsers ? Math.round((activeUsers / totalUsers) * 100) : 0;
      const retentionD3 = Math.max(0, retentionD1 - 10); // Simulação
      const retentionD7 = Math.max(0, retentionD1 - 20); // Simulação

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
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
