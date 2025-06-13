
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

export const useIsAdmin = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated) {
        logger.debug('Usuário não autenticado - não é admin', undefined, 'USE_IS_ADMIN');
        return false;
      }
      
      logger.debug('Verificando se usuário é admin', { userId: user.id }, 'USE_IS_ADMIN');
      
      // Usar a função is_admin() criada no banco
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        logger.error('Erro ao verificar se é admin', { error: error.message }, 'USE_IS_ADMIN');
        return false;
      }
      
      logger.debug('Resultado da verificação de admin', { isAdmin: data }, 'USE_IS_ADMIN');
      return data || false;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
  });
};
