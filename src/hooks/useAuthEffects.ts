
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { logger } from '@/utils/logger';

export const useAuthEffects = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>,
  processAuthentication: (session: any) => void
) => {
  const { setIsLoading } = authState;
  const { isMountedRef } = authRefs;
  const hasInitialized = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [isMountedRef]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    logger.debug('Configurando listeners de autenticação', undefined, 'AUTH_EFFECTS');

    const setupAuthListeners = async () => {
      try {
        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            logger.debug('Evento de autenticação detectado', { 
              event, 
              hasSession: !!session,
              userId: session?.user?.id 
            }, 'AUTH_EFFECTS');

            // Processar autenticação de forma assíncrona com timeout
            setTimeout(async () => {
              const callback = async () => {
                try {
                  await processAuthentication(session);
                } catch (error: any) {
                  logger.error('Erro no processamento de autenticação', { 
                    error: error.message,
                    event 
                  }, 'AUTH_EFFECTS');
                }
              };
              
              await callback();
            }, 0);
          }
        );

        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.warn('Erro ao obter sessão inicial', { 
            error: error.message 
          }, 'AUTH_EFFECTS');
        } else {
          logger.debug('Sessão inicial verificada', { 
            hasSession: !!session,
            userId: session?.user?.id 
          }, 'AUTH_EFFECTS');
        }

        if (session) {
          await processAuthentication(session);
        } else {
          setIsLoading(false);
        }

        return () => {
          logger.debug('Limpando subscription de auth', undefined, 'AUTH_EFFECTS');
          subscription.unsubscribe();
        };

      } catch (error: any) {
        logger.error('Erro ao configurar autenticação', { 
          error: error.message 
        }, 'AUTH_EFFECTS');
        setIsLoading(false);
      }
    };

    const cleanup = setupAuthListeners();
    
    return () => {
      cleanup.then(cleanupFn => {
        if (typeof cleanupFn === 'function') {
          cleanupFn();
        }
      });
    };
  }, [processAuthentication, setIsLoading, isMountedRef]);
};
