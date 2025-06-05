
import { useState, useEffect, useRef, useCallback } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { createFallbackUser, createTimeoutPromise } from '@/utils/authHelpers';
import type { AuthContextType } from '@/types/auth';
import type { ApiResponse } from '@/types';

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Use refs to prevent race conditions
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessedSessionRef = useRef<string | null>(null);

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
  }, []);

  useEffect(() => {
    console.log('Iniciando verificação de autenticação...');
    isMountedRef.current = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('getSession - Sessão encontrada:', !!session, 'Erro:', sessionError);
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setError('Erro ao verificar autenticação');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        await processAuthentication(session);
      } catch (err) {
        console.error('Erro ao verificar autenticação inicial:', err);
        setIsAuthenticated(false);
        setUser(null);
        setError('Erro de conexão');
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processando login para:', session.user.email);
          await processAuthentication(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('Processando logout');
          setUser(null);
          setIsAuthenticated(false);
          setError(undefined);
          setIsLoading(false);
          lastProcessedSessionRef.current = null;
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed para:', session.user.email);
          // Para token refresh, só processar se for um usuário diferente
          if (!user || user.id !== session.user.id) {
            await processAuthentication(session);
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      subscription.unsubscribe();
    };
  }, [processAuthentication]); // Apenas processAuthentication como dependência

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError(undefined);
      } else {
        setError(response.error || 'Erro no login');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro inesperado no login');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError(undefined);
      } else {
        setError(response.error || 'Erro no registro');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Erro inesperado no registro');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(undefined);
      lastProcessedSessionRef.current = null;
    } catch (err) {
      console.error('Erro no logout:', err);
      setError('Erro no logout');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
  };
};
