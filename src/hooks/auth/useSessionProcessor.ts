
import { useCallback } from 'react';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { validateSession, getSessionId, shouldProcessSession } from '@/utils/sessionValidation';
import { processUserAuthentication } from '@/utils/authProcessor';
import { logger } from '@/utils/logger';

export const useSessionProcessor = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>
) => {
  const {
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setError,
  } = authState;

  const {
    isProcessingRef,
    isMountedRef,
    lastProcessedSessionRef,
  } = authRefs;

  const processAuthentication = useCallback(async (session: any) => {
    const sessionId = getSessionId(session);
    
    if (!shouldProcessSession(sessionId, lastProcessedSessionRef, isProcessingRef, isMountedRef)) {
      return;
    }

    if (!validateSession(session)) {
      logger.debug('Nenhuma sessão encontrada', undefined, 'SESSION_PROCESSOR');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      setError(undefined);
      lastProcessedSessionRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessedSessionRef.current = sessionId;

    const callbacks = {
      setUser,
      setIsAuthenticated,
      setIsLoading,
      setError,
    };

    try {
      await processUserAuthentication(session, callbacks, isMountedRef);
    } finally {
      isProcessingRef.current = false;
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError, isProcessingRef, isMountedRef, lastProcessedSessionRef]);

  return {
    processAuthentication,
  };
};
