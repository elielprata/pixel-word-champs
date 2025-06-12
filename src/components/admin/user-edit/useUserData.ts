
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useUserData = (userId: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      logger.debug('Buscando dados completos do usuário', { userId }, 'USER_DATA_HOOK');
      
      // Buscar roles atuais
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        logger.error('Erro ao buscar roles', { error: rolesError, userId }, 'USER_DATA_HOOK');
        throw rolesError;
      }

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError) {
        logger.error('Erro ao buscar perfil', { error: profileError, userId }, 'USER_DATA_HOOK');
      }

      // Buscar email real usando a função do banco
      let finalEmail = 'Email não disponível';
      try {
        const { data: usersData, error: usersError } = await supabase.rpc('get_users_with_real_emails');
        
        if (!usersError && usersData) {
          const userData = usersData.find(user => user.id === userId);
          if (userData && userData.email) {
            finalEmail = userData.email;
          }
        }
      } catch (error) {
        logger.warn('Erro ao buscar email real', { error, userId }, 'USER_DATA_HOOK');
        
        // Fallback: tentar buscar através do auth se for o usuário atual
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && user.id === userId && user.email) {
            finalEmail = user.email;
          } else if (profileData?.username) {
            // Último fallback: usar username como base
            if (profileData.username.includes('@')) {
              finalEmail = profileData.username;
            } else {
              finalEmail = `${profileData.username}@sistema.local`;
            }
          }
        } catch (fallbackError) {
          logger.warn('Erro no fallback de email', { error: fallbackError, userId }, 'USER_DATA_HOOK');
        }
      }

      logger.info('Dados do usuário carregados', { 
        userId,
        hasRoles: rolesData?.length || 0,
        hasProfile: !!profileData,
        hasEmail: finalEmail !== 'Email não disponível'
      }, 'USER_DATA_HOOK');
      
      return {
        roles: rolesData?.map(r => r.role) || [],
        email: finalEmail,
        username: profileData?.username || 'Username não disponível'
      };
    },
    enabled: isOpen && !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
