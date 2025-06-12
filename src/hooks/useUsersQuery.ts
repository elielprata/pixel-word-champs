
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AllUsersData {
  id: string;
  username: string;
  email: string;
  total_score: number;
  games_played: number;
  is_banned: boolean;
  banned_at?: string;
  banned_by?: string;
  ban_reason?: string;
  created_at: string;
  roles: string[];
}

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async (): Promise<AllUsersData[]> => {
      console.log('🔍 Buscando todos os usuários com emails reais...');
      
      // Usar a nova função que retorna emails reais
      const { data, error } = await supabase.rpc('get_users_with_real_emails');

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }

      // Converter os dados para o formato esperado
      const users: AllUsersData[] = data.map(user => ({
        id: user.id,
        username: user.username || 'Usuário',
        email: user.email, // Agora vem diretamente da função com o email real
        total_score: user.total_score || 0,
        games_played: user.games_played || 0,
        is_banned: user.is_banned || false,
        banned_at: user.banned_at,
        banned_by: user.banned_by,
        ban_reason: user.ban_reason,
        created_at: user.created_at,
        roles: user.roles || ['user']
      }));

      console.log('👥 Total de usuários encontrados:', users.length);
      console.log('📧 Exemplos de emails processados:', users.slice(0, 2).map(u => ({ username: u.username, email: u.email })));
      
      return users;
    },
    retry: 2,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
