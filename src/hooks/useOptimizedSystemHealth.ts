
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { type SystemHealth } from '@/types/admin';

export const useOptimizedSystemHealth = () => {
  return useQuery({
    queryKey: ['optimizedSystemHealth'],
    queryFn: async (): Promise<SystemHealth> => {
      logger.debug('Iniciando verificação otimizada de saúde do sistema', undefined, 'OPTIMIZED_SYSTEM_HEALTH');
      
      const startTime = Date.now();
      const healthChecks: SystemHealth = {
        database: false,
        authentication: false,
        permissions: false,
        performance: 0
      };

      try {
        // Verificações paralelas para melhor performance
        const [dbCheck, authCheck] = await Promise.allSettled([
          // Verificar conexão com banco usando consulta mais leve
          supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
          // Verificar autenticação
          supabase.auth.getUser()
        ]);

        // Processar resultado da verificação do banco
        healthChecks.database = dbCheck.status === 'fulfilled' && !dbCheck.value.error;
        
        // Processar resultado da autenticação
        const authResult = authCheck.status === 'fulfilled' ? authCheck.value : null;
        healthChecks.authentication = !authResult?.error && !!authResult?.data?.user;

        // Verificar permissões apenas se autenticação passou
        if (healthChecks.authentication && authResult?.data?.user) {
          try {
            const { data: isAdmin, error: permError } = await supabase.rpc('is_admin');
            healthChecks.permissions = !permError && isAdmin;
          } catch (error: any) {
            logger.warn('Erro na verificação de permissões', { error: error.message }, 'OPTIMIZED_SYSTEM_HEALTH');
            healthChecks.permissions = false;
          }
        }

        healthChecks.performance = Date.now() - startTime;
        
        logger.info('Verificação otimizada de saúde concluída', { 
          healthChecks,
          executionTime: healthChecks.performance
        }, 'OPTIMIZED_SYSTEM_HEALTH');
        
        return healthChecks;
        
      } catch (error: any) {
        logger.error('Erro crítico na verificação otimizada', { error: error.message }, 'OPTIMIZED_SYSTEM_HEALTH');
        healthChecks.performance = Date.now() - startTime;
        return healthChecks;
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: (query) => {
      // Polling inteligente baseado na saúde do sistema
      if (!query.state.data) return 30000; // 30s se não há dados
      const isHealthy = query.state.data.database && query.state.data.authentication && query.state.data.permissions;
      return isHealthy ? 5 * 60 * 1000 : 60 * 1000; // 5min se saudável, 1min se não
    },
    retry: (failureCount, error) => {
      // Retry mais inteligente
      if (failureCount >= 3) return false;
      logger.warn(`Tentativa ${failureCount + 1} de verificação de saúde`, { error }, 'OPTIMIZED_SYSTEM_HEALTH');
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(2000 * Math.pow(1.5, attemptIndex), 10000),
  });
};
