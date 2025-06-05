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

  const processAuthentication = async (session: any) => {
    if (!session?.user) {
      console.log('Nenhuma sessão encontrada');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    console.log('Sessão encontrada para:', session.user.email);
    
    try {
      console.log('Tentando getCurrentUser com timeout...');
      
      const timeoutPromise = createTimeoutPromise(5000);
      const getUserPromise = authService.getCurrentUser();
      
      const response = await Promise.race([getUserPromise, timeoutPromise]) as ApiResponse<User>;
      console.log('Response do getCurrentUser:', response);
      
      if (response?.success && response?.data) {
        console.log('Definindo usuário autenticado:', response.data.username);
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.log('getCurrentUser não retornou dados válidos, usando fallback');
        const fallbackUser = createFallbackUser(session);
        setUser(fallbackUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ou timeout na getCurrentUser:', error);
      console.log('Usando dados básicos da sessão...');
      const fallbackUser = createFallbackUser(session);
      setUser(fallbackUser);
      setIsAuthenticated(true);
    } finally {
      console.log('Finalizando processamento - definindo isLoading = false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Iniciando verificação de autenticação...');
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('getSession - Sessão encontrada:', !!session, 'Erro:', sessionError);
        
        await processAuthentication(session);
      } catch (err) {
        console.error('Erro ao verificar autenticação inicial:', err);
        setIsAuthenticated(false);
        setUser(null);
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
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setError(response.error || 'Erro no login');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro inesperado no login');
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
      } else {
        setError(response.error || 'Erro no registro');
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Erro inesperado no registro');
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
    } catch (err) {
      console.error('Erro no logout:', err);
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
