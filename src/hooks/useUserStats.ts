
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalAdmins: number;
  averageScore: number;
  totalGamesPlayed: number;
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('🔍 Buscando estatísticas dos usuários...');

      // Buscar total de usuários
      const { count: totalUsers, error: totalUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalUsersError) {
        console.error('❌ Erro ao buscar total de usuários:', totalUsersError);
        throw totalUsersError;
      }

      // Buscar usuários ativos (que jogaram nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activeUsers, error: activeUsersError } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('started_at', sevenDaysAgo.toISOString());

      if (activeUsersError) {
        console.error('❌ Erro ao buscar usuários ativos:', activeUsersError);
      }

      // Buscar novos usuários hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: newUsersToday, error: newUsersTodayError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (newUsersTodayError) {
        console.error('❌ Erro ao buscar novos usuários hoje:', newUsersTodayError);
      }

      // Buscar total de admins
      const { count: totalAdmins, error: totalAdminsError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (totalAdminsError) {
        console.error('❌ Erro ao buscar total de admins:', totalAdminsError);
      }

      // Buscar estatísticas de pontuação e jogos
      const { data: scoreStats, error: scoreStatsError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .not('total_score', 'is', null)
        .not('games_played', 'is', null);

      if (scoreStatsError) {
        console.error('❌ Erro ao buscar estatísticas de pontuação:', scoreStatsError);
      }

      const averageScore = scoreStats?.length 
        ? Math.round(scoreStats.reduce((sum, user) => sum + (user.total_score || 0), 0) / scoreStats.length)
        : 0;

      const totalGamesPlayed = scoreStats?.length
        ? scoreStats.reduce((sum, user) => sum + (user.games_played || 0), 0)
        : 0;

      console.log('📊 Estatísticas calculadas:', {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalAdmins: totalAdmins || 0,
        averageScore,
        totalGamesPlayed
      });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalAdmins: totalAdmins || 0,
        averageScore,
        totalGamesPlayed
      };
    },
    retry: 2,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
