
import { useCallback, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { useAuthEffects } from './useAuthEffects';
import { validateSession, getSessionId, shouldProcessSession } from '@/utils/sessionValidation';
import { processUserAuthentication } from '@/utils/authProcessor';
import type { AuthContextType } from '@/types/auth';
import { logger } from '@/utils/logger';

export const useAuthProvider = (): AuthContextType => {
  const authState = useAuthState();
  const authOperations = useAuthOperations(authState, authState);
  
  logger.debug('useAuthProvider inicializado', {
    hasUser: !!authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading
  }, 'USE_AUTH_PROVIDER');

  const processAuthentication = useCallback(async (session: any) => {
    if (!validateSession(session)) {
      logger.debug('Sessão inválida, limpando estado', undefined, 'USE_AUTH_PROVIDER');
      authState.setUser(null);
      authState.setIsAuthenticated(false);
      authState.setIsLoading(false);
      authState.setError('');
      return;
    }

    const sessionId = getSessionId(session);
    
    if (!shouldProcessSession(
      sessionId,
      authState.lastProcessedSessionRef,
      authState.isProcessingRef,
      authState.isMountedRef
    )) {
      return;
    }

    authState.isProcessingRef.current = true;
    authState.lastProcessedSessionRef.current = sessionId;

    logger.info('Processando autenticação de sessão', { 
      sessionId,
      userId: session.user?.id 
    }, 'USE_AUTH_PROVIDER');

    try {
      await processUserAuthentication(session, authState, authState.isMountedRef);
    } catch (error: any) {
      logger.error('Erro no processamento de autenticação', { 
        error: error.message,
        sessionId 
      }, 'USE_AUTH_PROVIDER');
    } finally {
      authState.isProcessingRef.current = false;
    }
  }, [authState]);

  useAuthEffects(authState, authState, processAuthentication);

  logger.debug('useAuthProvider retornando contexto', {
    hasUser: !!authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    hasError: !!authState.error
  }, 'USE_AUTH_PROVIDER');

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login: authOperations.login,
    register: authOperations.register,
    logout: authOperations.logout,
  };
};
