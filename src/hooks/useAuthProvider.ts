
import { useState, useEffect } from 'react';
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

  // Controle de race conditions melhorado
  let isProcessing = false;
  let isMounted = true;

  const processAuthentication = async (session: any) => {
    if (isProcessing || !isMounted) return;
    isProcessing = true;

    if (!session?.user) {
      console.log('Nenhuma sessão encontrada');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      isProcessing = false;
      return;
    }

    console.log('Sessão encontrada para:', session.user.email);
    
    try {
      console.log('Tentando getCurrentUser com timeout reduzido...');
      
      // Reduzir timeout para 3 segundos e usar fallback mais rápido
      const timeoutPromise = createTimeoutPromise(3000);
      const getUserPromise = authService.getCurrentUser();
      
      const response = await Promise.race([getUserPromise, timeoutPromise]) as ApiResponse<User>;
      console.log('Response do getCurrentUser:', response);
      
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
      // Em caso de timeout, usar fallback imediatamente
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
      console.log('Finalizando processamento - definindo isLoading = false');
      setIsLoading(false);
      isProcessing = false;
    }
  };

  useEffect(() => {
    console.log('Iniciando verificação de autenticação...');
    
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
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed, mantendo usuário atual se for o mesmo');
          if (user?.id === session.user.id) {
            // Manter dados existentes se for o mesmo usuário
            setIsAuthenticated(true);
          } else {
            await processAuthentication(session);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
