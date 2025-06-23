
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
          logger.error('Erro ao verificar se é admin', { error: error.message }, 'USE_IS_ADMIN_ROBUST');
          
          // Fallback: verificar diretamente na tabela user_roles
          logger.info('Tentando fallback de verificação admin', undefined, 'USE_IS_ADMIN_ROBUST');
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
          
          if (roleError && roleError.code !== 'PGRST116') {
            logger.error('Fallback também falhou', { error: roleError.message }, 'USE_IS_ADMIN_ROBUST');
            throw roleError;
          }
          
          const isAdminFallback = !!roleData;
          logger.debug('Resultado do fallback', { isAdmin: isAdminFallback }, 'USE_IS_ADMIN_ROBUST');
          return isAdminFallback;
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
    retry: 3, // Tentar 3 vezes em caso de falha
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });
};
