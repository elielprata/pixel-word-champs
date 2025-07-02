
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
          (event, session) => {
            logger.info('🔔 EVENTO DE AUTENTICAÇÃO DETECTADO', { 
              event, 
              hasSession: !!session,
              userId: session?.user?.id,
              email: session?.user?.email,
              provider: session?.user?.app_metadata?.provider,
              timestamp: new Date().toISOString()
            }, 'AUTH_EFFECTS');

            // Log detalhado da sessão apenas se necessário
            if (session) {
              logger.debug('📋 Detalhes da sessão:', {
                accessToken: session.access_token ? 'presente' : 'ausente',
                refreshToken: session.refresh_token ? 'presente' : 'ausente',
                expiresAt: session.expires_at,
                isExpired: session.expires_at ? (session.expires_at < Date.now() / 1000) : false,
                userMetadata: session.user?.user_metadata,
                appMetadata: session.user?.app_metadata
              }, 'AUTH_EFFECTS');
            }

            // Processar autenticação de forma síncrona e direta
            if (!isMountedRef.current) {
              logger.warn('⚠️ Componente desmontado - ignorando evento de auth', undefined, 'AUTH_EFFECTS');
              return;
            }

            // Usar setTimeout para evitar problemas de deadlock
            setTimeout(() => {
              if (!isMountedRef.current) return;
              
              try {
                processAuthentication(session);
              } catch (error: any) {
                logger.error('❌ Erro no processamento de autenticação', { 
                  error: error.message,
                  event,
                  userId: session?.user?.id,
                  stack: error.stack
                }, 'AUTH_EFFECTS');
              }
            }, 0);
          }
        );

        // Verificar sessão atual com logs detalhados
        logger.debug('Verificando sessão inicial...', undefined, 'AUTH_EFFECTS');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.warn('Erro ao obter sessão inicial', { 
            error: error.message 
          }, 'AUTH_EFFECTS');
        } else {
          logger.debug('Resultado da verificação de sessão inicial:', { 
            hasSession: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider,
            isExpired: session?.expires_at ? (session.expires_at < Date.now() / 1000) : false
          }, 'AUTH_EFFECTS');
        }

        if (session) {
          logger.info('🔍 SESSÃO INICIAL ENCONTRADA - processando...', { 
            userId: session.user?.id 
          }, 'AUTH_EFFECTS');
          processAuthentication(session);
        } else {
          logger.debug('❌ Nenhuma sessão inicial encontrada - definindo loading como false', undefined, 'AUTH_EFFECTS');
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
