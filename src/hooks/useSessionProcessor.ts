
import { useCallback } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';
import { createFallbackUser, createTimeoutPromise } from '@/utils/authHelpers';
import type { ApiResponse } from '@/types';
import { useAuthState } from './useAuthState';

export const useSessionProcessor = (authState: ReturnType<typeof useAuthState>) => {
  const {
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setError,
    isProcessingRef,
    isMountedRef,
    lastProcessedSessionRef,
  } = authState;

  const processAuthentication = useCallback(async (session: any) => {
    // Prevent multiple simultaneous processing of the same session
    const sessionId = session?.user?.id || null;
    if (isProcessingRef.current || !isMountedRef.current) {
      console.log('Processamento já em andamento ou componente desmontado');
      return;
    }

    if (lastProcessedSessionRef.current === sessionId) {
      console.log('Sessão já processada:', sessionId);
      return;
    }

    if (!session?.user) {
      console.log('Nenhuma sessão encontrada');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      setError(undefined);
      lastProcessedSessionRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessedSessionRef.current = sessionId;

    console.log('Processando sessão para:', session.user.email);
    
    try {
      console.log('Tentando getCurrentUser com timeout reduzido...');
      
      const timeoutPromise = createTimeoutPromise(3000);
      const getUserPromise = authService.getCurrentUser();
      
      const response = await Promise.race([getUserPromise, timeoutPromise]) as ApiResponse<User>;
      console.log('Response do getCurrentUser:', response);
      
      if (!isMountedRef.current) return;
      
      if (response?.success && response?.data) {
        console.log('Definindo usuário autenticado:', response.data.username);
        setUser(response.data);
        setIsAuthenticated(true);
        setError(undefined);
      } else {
        console.log('getCurrentUser falhou, usando fallback direto');
        const fallbackUser = createFallbackUser(session);
        setUser(fallbackUser);
        setIsAuthenticated(true);
        setError(undefined);
      }
    } catch (error) {
      console.log('Timeout ou erro - usando fallback direto:', error);
      if (!isMountedRef.current) return;
      
      try {
        const fallbackUser = createFallbackUser(session);
        setUser(fallbackUser);
        setIsAuthenticated(true);
        setError(undefined);
      } catch (fallbackError) {
        console.error('Erro ao criar fallback user:', fallbackError);
        setIsAuthenticated(false);
        setUser(null);
        setError('Erro de autenticação');
      }
    } finally {
      if (isMountedRef.current) {
        console.log('Finalizando processamento - definindo isLoading = false');
        setIsLoading(false);
      }
      isProcessingRef.current = false;
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError, isProcessingRef, isMountedRef, lastProcessedSessionRef]);

  return {
    processAuthentication,
  };
};
