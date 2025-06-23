
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';

interface SimpleAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode?: string;
}

type SuccessCallback = (email: string) => void;

export const useSimpleAuth = () => {
  const [state, setState] = useState<SimpleAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined
  });

  const isMountedRef = useRef(true);

  // Função de login simplificada
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await authService.login(credentials);
      
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!.user,
          isAuthenticated: true,
          isLoading: false,
          error: undefined
        }));
        logger.info('Login realizado com sucesso', { userId: response.data.user.id }, 'SIMPLE_AUTH');
      } else {
        const errorMessage = response.error || 'Erro no login';
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage
        }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.message || 'Erro de conexão';
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Função de registro simplificada com callback de sucesso
  const register = useCallback(async (userData: RegisterData, onSuccess?: SuccessCallback) => {
    console.log('🚀 [SIMPLE_AUTH] Registro iniciado com callback:', !!onSuccess);
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await authService.register(userData);
      
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        console.log('✅ [SIMPLE_AUTH] Registro bem-sucedido!');
        
        setState(prev => ({
          ...prev,
          user: response.data!.user,
          isAuthenticated: false, // Manter false até confirmação
          isLoading: false,
          error: undefined
        }));

        // EXECUTAR CALLBACK IMEDIATAMENTE
        if (onSuccess) {
          console.log('🎯 [SIMPLE_AUTH] Executando callback de sucesso...');
          setTimeout(() => {
            onSuccess(userData.email);
          }, 50); // Micro delay para garantir que o DOM está pronto
        }

        logger.info('Registro realizado com sucesso', { userId: response.data.user.id }, 'SIMPLE_AUTH');
        return response.data;
      } else {
        const errorMessage = response.error || 'Erro no registro';
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage
        }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.message || 'Erro de conexão';
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Função de logout simplificada
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      
      if (isMountedRef.current) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined
        });
        logger.info('Logout realizado com sucesso', undefined, 'SIMPLE_AUTH');
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = error.message || 'Erro no logout';
        setState(prev => ({ ...prev, error: errorMessage }));
        logger.error('Erro durante logout', { error: errorMessage }, 'SIMPLE_AUTH');
      }
    }
  }, []);

  // Inicialização e listener de auth
  useEffect(() => {
    // Setup do listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [SIMPLE_AUTH] Auth state changed:', event);
        
        if (session?.user) {
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data && isMountedRef.current) {
              setState({
                user: response.data,
                isAuthenticated: !!session.user.email_confirmed_at,
                isLoading: false,
                error: undefined
              });
            }
          } catch (error) {
            console.error('Erro ao buscar usuário atual:', error);
            if (isMountedRef.current) {
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: undefined
              });
            }
          }
        } else {
          if (isMountedRef.current) {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: undefined
            });
          }
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getCurrentUser().then(response => {
          if (response.success && response.data && isMountedRef.current) {
            setState({
              user: response.data,
              isAuthenticated: !!session.user.email_confirmed_at,
              isLoading: false,
              error: undefined
            });
          }
        });
      } else {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    login,
    register,
    logout
  };
};
