
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AllUsersData {
  id: string;
  username: string;
  email: string;
  total_score: number;
  games_played: number;
  is_banned: boolean;
  banned_at: string | null;
  banned_by: string | null;
  ban_reason: string | null;
  created_at: string;
  roles: string[];
}

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async (): Promise<AllUsersData[]> => {
      logger.debug('Buscando todos os usuários...', undefined, 'USE_USERS_QUERY');
      
      // Usar a função otimizada que funciona com as novas políticas RLS
      const { data: users, error } = await supabase
        .rpc('get_users_with_real_emails');

      if (error) {
        logger.error('Erro ao buscar usuários', { error: error.message }, 'USE_USERS_QUERY');
        throw error;
      }

      const usersData: AllUsersData[] = (users || []).map((user: any) => ({
        id: user.id,
        username: user.username || 'Usuário sem nome',
        email: user.email || 'Email não disponível',
        total_score: user.total_score || 0,
        games_played: user.games_played || 0,
        is_banned: user.is_banned || false,
        banned_at: user.banned_at,
        banned_by: user.banned_by,
        ban_reason: user.ban_reason,
        created_at: user.created_at || new Date().toISOString(),
        roles: user.roles || ['user']
      }));

      logger.info('Usuários carregados com sucesso', { count: usersData.length }, 'USE_USERS_QUERY');
      return usersData;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
  });
};
