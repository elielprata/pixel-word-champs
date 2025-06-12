
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = (userId: string) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId as any);

      if (error) throw error;

      const validRoles = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item))
        .map((item: any) => item.role);
      
      setUserRoles(validRoles);
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .single();

      if (error) throw error;

      // Validar dados do usuário
      if (data && typeof data === 'object' && !('error' in data)) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const fetchAllUsersData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_users_with_real_emails');
      
      if (error) throw error;

      // Validar e filtrar dados - verificar se data não é null e é array
      const validUsers = (Array.isArray(data) && data !== null) ? data.filter((user: any) => 
        user && typeof user === 'object' && !('error' in user)
      ) : [];

      const currentUser = validUsers.find((user: any) => user.id === userId);
      
      if (currentUser) {
        setUserData({
          id: currentUser.id,
          username: (currentUser && typeof currentUser === 'object' && !('error' in currentUser)) 
            ? currentUser.username || 'Usuário' 
            : 'Usuário',
          email: (currentUser && typeof currentUser === 'object' && !('error' in currentUser)) 
            ? currentUser.email || 'Email não disponível' 
            : 'Email não disponível',
          total_score: (currentUser && typeof currentUser === 'object' && !('error' in currentUser)) 
            ? currentUser.total_score || 0 
            : 0,
          games_played: (currentUser && typeof currentUser === 'object' && !('error' in currentUser)) 
            ? currentUser.games_played || 0 
            : 0,
          is_banned: currentUser.is_banned || false,
          banned_at: currentUser.banned_at,
          banned_by: currentUser.banned_by,
          ban_reason: currentUser.ban_reason,
          created_at: currentUser.created_at,
        });

        // Extrair roles do array - verificar se data não é null
        const roles = (Array.isArray(currentUser.roles) && currentUser.roles !== null) ? currentUser.roles : [];
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Erro ao buscar dados completos do usuário:', error);
      // Fallback para métodos separados
      await fetchUserData();
      await fetchUserRoles();
    }
  };

  const fetchUserRolesSeparately = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId as any);

      if (error) throw error;

      const validRoles = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item) && (item as any).role)
        .map((item: any) => (item as any).role);
      
      setUserRoles(validRoles);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetchAllUsersData().finally(() => setIsLoading(false));
    }
  }, [userId]);

  const refetch = () => {
    if (userId) {
      setIsLoading(true);
      fetchAllUsersData().finally(() => setIsLoading(false));
    }
  };

  return {
    userRoles,
    userData,
    isLoading,
    refetch,
  };
};
