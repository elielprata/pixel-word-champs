
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useAuthCleanup = () => {
  useEffect(() => {
    const performAuthCleanup = async () => {
      try {
        logger.debug('Iniciando verificação de limpeza de autenticação', undefined, 'AUTH_CLEANUP');

        // Verificar se existe uma sessão válida
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.warn('Erro ao verificar sessão - realizando limpeza', { error: error.message }, 'AUTH_CLEANUP');
          
          // Se há erro na sessão, limpar localStorage relacionado ao Supabase
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('sb-'))) {
              keysToRemove.push(key);
            }
          }
          
          if (keysToRemove.length > 0) {
            logger.info('Removendo chaves inválidas do localStorage', { keys: keysToRemove }, 'AUTH_CLEANUP');
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
        } else if (session) {
          logger.debug('Sessão válida encontrada', { 
            userId: session.user?.id,
            email: session.user?.email,
            expiresAt: session.expires_at 
          }, 'AUTH_CLEANUP');

          // Verificar se a sessão não expirou
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            logger.warn('Sessão expirada detectada - realizando limpeza', { 
              expiresAt: session.expires_at,
              now 
            }, 'AUTH_CLEANUP');
            
            await supabase.auth.signOut();
          }
        } else {
          logger.debug('Nenhuma sessão encontrada - estado limpo', undefined, 'AUTH_CLEANUP');
        }
      } catch (error: any) {
        logger.error('Erro durante limpeza de autenticação', { error: error.message }, 'AUTH_CLEANUP');
      }
    };

    // Executar limpeza com pequeno delay para permitir inicialização completa
    const timeoutId = setTimeout(performAuthCleanup, 100);

    return () => clearTimeout(timeoutId);
  }, []);
};
