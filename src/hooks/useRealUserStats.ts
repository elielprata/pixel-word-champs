
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  adminUsers: number;
}

export const useRealUserStats = () => {
  return useQuery({
    queryKey: ['realUserStats'],
    queryFn: async (): Promise<UserStats> => {
      console.log('📊 Buscando estatísticas reais de usuários...');

      try {
        // Total de usuários
        const { count: totalCount, error: totalError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error('Erro ao buscar total de usuários:', totalError);
        }

        // Usuários ativos (com pelo menos 1 jogo)
        const { data: activeData, error: activeError } = await supabase
          .from('profiles')
          .select('user_id')
          .gt('games_played', 0);

        if (activeError) {
          console.error('Erro ao buscar usuários ativos:', activeError);
        }

        // Filter and validate active data
        const validActiveUsers = (activeData || []).filter((item: any) => 
          item && typeof item === 'object' && !('error' in item) && item.user_id
        );

        // Novos usuários hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const { data: newTodayData, error: newTodayError } = await supabase
          .from('profiles')
          .select('total_score, games_played')
          .gte('created_at', todayStr);

        if (newTodayError) {
          console.error('Erro ao buscar novos usuários:', newTodayError);
        }

        // Filter and validate new users data
        const validNewUsers = (newTodayData || []).filter((item: any) => 
          item && typeof item === 'object' && !('error' in item) && 
          typeof item.games_played === 'number' && typeof item.total_score === 'number'
        );

        // Usuários admin
        const { data: adminData, error: adminError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin' as any);

        if (adminError) {
          console.error('Erro ao buscar usuários admin:', adminError);
        }

        const stats = {
          totalUsers: totalCount || 0,
          activeUsers: validActiveUsers.length,
          newUsersToday: validNewUsers.length,
          adminUsers: (adminData || []).length
        };

        console.log('📊 Estatísticas de usuários:', stats);
        return stats;
      } catch (error) {
        console.error('❌ Erro geral ao buscar estatísticas:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          newUsersToday: 0,
          adminUsers: 0
        };
      }
    },
    retry: 2,
    refetchInterval: 60000, // Atualizar a cada minuto
  });
};

// Hook para buscar dados detalhados de crescimento
export const useDetailedUserStats = () => {
  return useQuery({
    queryKey: ['detailedUserStats'],
    queryFn: async () => {
      console.log('📈 Buscando dados detalhados de usuários...');

      const { data: detailedData, error } = await supabase
        .from('profiles')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Filter and validate detailed data
      const validDetailedData = (detailedData || []).filter((item: any) => 
        item && typeof item === 'object' && !('error' in item) && item.id
      );

      return {
        recentUsers: validDetailedData.length,
        last100Users: validDetailedData
      };
    },
    retry: 2,
  });
};

// Hook para buscar estatísticas de engajamento
export const useEngagementStats = () => {
  return useQuery({
    queryKey: ['engagementStats'],
    queryFn: async () => {
      console.log('🎯 Buscando estatísticas de engajamento...');

      const { data: sessionData, error } = await supabase
        .from('game_sessions')
        .select('user_id')
        .eq('is_completed', true as any);

      if (error) throw error;

      // Filter and validate session data
      const validSessionData = (sessionData || []).filter((item: any) => 
        item && typeof item === 'object' && !('error' in item) && item.user_id
      );

      return {
        completedSessions: validSessionData.length,
        uniqueActivePlayers: new Set(validSessionData.map(s => s.user_id)).size
      };
    },
    retry: 2,
  });
};
