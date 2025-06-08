
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AllUsersData {
  id: string;
  username: string;
  email?: string;
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
      console.log('🔍 Buscando todos os usuários...');
      
      // Buscar profiles com dados básicos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Buscar roles para todos os usuários
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.warn('⚠️ Erro ao buscar roles:', rolesError);
      }

      // Buscar o usuário atual para comparação
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Mapear dados
      const users: AllUsersData[] = profiles.map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.id).map(r => r.role) || ['user'];
        
        // Determinar email
        let email = 'Email não disponível';
        
        // Se for o usuário atual logado, usar o email real
        if (currentUser && currentUser.id === profile.id) {
          email = currentUser.email || 'Email não disponível';
        } else {
          // Para outros usuários, usar fallback inteligente
          if (profile.username) {
            if (profile.username.includes('@')) {
              email = profile.username;
            } else {
              email = `${profile.username}@sistema.local`;
            }
          }
        }
        
        return {
          id: profile.id,
          username: profile.username || 'Usuário',
          email: email,
          total_score: profile.total_score || 0,
          games_played: profile.games_played || 0,
          is_banned: profile.is_banned || false,
          banned_at: profile.banned_at,
          banned_by: profile.banned_by,
          ban_reason: profile.ban_reason,
          created_at: profile.created_at,
          roles: userRoles
        };
      });

      console.log('👥 Total de usuários encontrados:', users.length);
      console.log('📧 Exemplo de emails processados:', users.slice(0, 2).map(u => ({ username: u.username, email: u.email })));
      
      return users;
    },
    retry: 2,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};
