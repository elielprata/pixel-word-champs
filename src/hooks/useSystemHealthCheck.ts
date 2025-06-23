
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { type SystemHealth } from '@/types/admin';

export const useSystemHealthCheck = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: async (): Promise<SystemHealth> => {
      logger.debug('Iniciando verificação de saúde do sistema', undefined, 'SYSTEM_HEALTH');
      
      const startTime = Date.now();
      const healthChecks: SystemHealth = {
        database: false,
        authentication: false,
        permissions: false,
        performance: 0
      };

      try {
        // Verificar conexão com banco de dados
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        healthChecks.database = !dbError;
        
        if (dbError) {
          logger.warn('Falha na verificação do banco de dados', { error: dbError.message }, 'SYSTEM_HEALTH');
        }

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        healthChecks.authentication = !authError && !!user;
        
        if (authError) {
          logger.warn('Falha na verificação de autenticação', { error: authError.message }, 'SYSTEM_HEALTH');
        }

        // Verificar permissões (só se autenticação passou)
        if (healthChecks.authentication && user) {
          try {
            const { data: isAdmin, error: permError } = await supabase.rpc('is_admin');
            healthChecks.permissions = !permError && isAdmin;
            
            if (permError) {
              logger.warn('Falha na verificação de permissões', { error: permError.message }, 'SYSTEM_HEALTH');
            }
          } catch (error: any) {
            logger.warn('Erro na verificação de permissões', { error: error.message }, 'SYSTEM_HEALTH');
            healthChecks.permissions = false;
          }
        }

        // Calcular performance
        healthChecks.performance = Date.now() - startTime;
        
        const healthStatus = healthChecks.database && healthChecks.authentication && healthChecks.permissions ? 'healthy' : 'warning';
        
        logger.info('Verificação de saúde concluída', { 
          healthChecks, 
          status: healthStatus 
        }, 'SYSTEM_HEALTH');
        
        return healthChecks;
        
      } catch (error: any) {
        logger.error('Erro crítico na verificação de saúde', { error: error.message }, 'SYSTEM_HEALTH');
        healthChecks.performance = Date.now() - startTime;
        return healthChecks;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
};
