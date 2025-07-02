
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

export const useIsAdminRobust = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAuthenticated) {
        logger.debug('Usuário não autenticado - não é admin', undefined, 'USE_IS_ADMIN_ROBUST');
        return false;
      }
      
      logger.debug('Verificando se usuário é admin com retry', { userId: user.id }, 'USE_IS_ADMIN_ROBUST');
      
      try {
        // Usar a função is_admin() criada no banco
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          logger.warn('Erro ao usar função is_admin, tentando fallback', { error: error.message }, 'USE_IS_ADMIN_ROBUST');
          
          // Fallback mais robusto: verificar diretamente na tabela user_roles
          try {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle(); // Usar maybeSingle para evitar erro se não encontrar
            
            if (roleError) {
              logger.error('Fallback também falhou', { error: roleError.message }, 'USE_IS_ADMIN_ROBUST');
              return false; // Em caso de erro, assumir não-admin por segurança
            }
            
            const isAdminFallback = !!roleData;
            logger.debug('Resultado do fallback', { isAdmin: isAdminFallback }, 'USE_IS_ADMIN_ROBUST');
            return isAdminFallback;
          } catch (fallbackError: any) {
            logger.error('Fallback crítico falhou', { error: fallbackError.message }, 'USE_IS_ADMIN_ROBUST');
            return false;
          }
        }
        
        logger.debug('Resultado da verificação de admin', { isAdmin: data }, 'USE_IS_ADMIN_ROBUST');
        return data || false;
      } catch (error: any) {
        logger.error('Erro crítico na verificação de admin', { error: error.message }, 'USE_IS_ADMIN_ROBUST');
        // Em caso de erro crítico, assumir não-admin por segurança
        return false;
      }
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
    retry: 2, // Reduzir tentativas para não atrasar muito
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Backoff exponencial mais rápido
    retryOnMount: true,
  });
};
