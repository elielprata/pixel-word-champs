
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { useSessionProcessor } from './useSessionProcessor';
import { logger } from '@/utils/logger';

export const useAuthEffects = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>,
  processAuthentication: ReturnType<typeof useSessionProcessor>['processAuthentication']
) => {
  const {
    user,
    setIsAuthenticated,
    setUser,
    setError,
    setIsLoading,
  } = authState;

  const {
    isMountedRef,
    isProcessingRef,
    lastProcessedSessionRef,
  } = authRefs;

  useEffect(() => {
    logger.debug('Iniciando verificação de autenticação...', undefined, 'AUTH_EFFECTS');
    isMountedRef.current = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
          logger.debug('Sessão encontrada', { 
            userId: session.user.id,
            email: session.user.email,
            hasMetadata: !!session.user.user_metadata
          }, 'AUTH_EFFECTS');
        }
        
        if (sessionError) {
          logger.error('Erro ao obter sessão', { error: sessionError.message }, 'AUTH_EFFECTS');
          setError('Erro ao verificar autenticação');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        await processAuthentication(session);
      } catch (err: any) {
        logger.error('Erro ao verificar autenticação inicial', { error: err.message }, 'AUTH_EFFECTS');
        setIsAuthenticated(false);
        setUser(null);
        setError('Erro de conexão');
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Mudança de estado de autenticação', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id 
        }, 'AUTH_EFFECTS');
        
        if (event === 'SIGNED_IN' && session?.user) {
          logger.info('Usuário logado', { userId: session.user.id }, 'AUTH_EFFECTS');
          await processAuthentication(session);
        } else if (event === 'SIGNED_OUT') {
          logger.info('Usuário deslogado', undefined, 'AUTH_EFFECTS');
          setUser(null);
          setIsAuthenticated(false);
          setError(undefined);
          setIsLoading(false);
          lastProcessedSessionRef.current = null;
        } else if (event === 'TOKEN_REFRESHED' && session) {
          logger.debug('Token atualizado', { userId: session.user.id }, 'AUTH_EFFECTS');
          // Para token refresh, só processar se for um usuário diferente
          if (!user || user.id !== session.user.id) {
            await processAuthentication(session);
          }
        } else if (event === 'INITIAL_SESSION' && !session) {
          // Garantir que o loading pare quando não há sessão inicial
          logger.debug('Nenhuma sessão inicial encontrada', undefined, 'AUTH_EFFECTS');
          setIsLoading(false);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Removido processAuthentication das dependências para evitar loop infinito
};
