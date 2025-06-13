
import { useCallback } from 'react';
import { authService } from '@/services/authService';
import { LoginForm, RegisterForm } from '@/types';
import { useAuthStateCore } from '@/hooks/auth/useAuthStateCore';
import { useAuthRefs } from '@/hooks/auth/useAuthRefs';
import { logger } from '@/utils/logger';

export const useAuthOperations = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>
) => {
  const {
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setError,
  } = authState;

  const { isMountedRef } = authRefs;

  const login = useCallback(async (credentials: LoginForm) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError('');

    try {
      logger.info('Iniciando processo de login', { email: credentials.email }, 'AUTH_OPERATIONS');
      
      const response = await authService.login(credentials);
      
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError('');
        logger.info('Login realizado com sucesso', { userId: response.data.user.id }, 'AUTH_OPERATIONS');
      } else {
        const errorMessage = response.error || 'Erro no login';
        setError(errorMessage);
        setIsAuthenticated(false);
        setUser(null);
        logger.error('Falha no login', { error: errorMessage }, 'AUTH_OPERATIONS');
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.message || 'Erro de conexão';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      logger.error('Erro durante login', { error: errorMessage }, 'AUTH_OPERATIONS');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError, isMountedRef]);

  const register = useCallback(async (userData: RegisterForm) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError('');

    try {
      logger.info('Iniciando processo de registro', { email: userData.email, username: userData.username }, 'AUTH_OPERATIONS');
      
      const response = await authService.register(userData);
      
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError('');
        logger.info('Registro realizado com sucesso', { userId: response.data.user.id }, 'AUTH_OPERATIONS');
      } else {
        const errorMessage = response.error || 'Erro no registro';
        setError(errorMessage);
        setIsAuthenticated(false);
        setUser(null);
        logger.error('Falha no registro', { error: errorMessage }, 'AUTH_OPERATIONS');
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.message || 'Erro de conexão';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      logger.error('Erro durante registro', { error: errorMessage }, 'AUTH_OPERATIONS');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError, isMountedRef]);

  const logout = useCallback(async () => {
    try {
      logger.info('Iniciando logout', undefined, 'AUTH_OPERATIONS');
      await authService.logout();
      
      if (isMountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
        setError('');
        logger.info('Logout realizado com sucesso', undefined, 'AUTH_OPERATIONS');
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        const errorMessage = error.message || 'Erro no logout';
        setError(errorMessage);
        logger.error('Erro durante logout', { error: errorMessage }, 'AUTH_OPERATIONS');
      }
    }
  }, [setUser, setIsAuthenticated, setError, isMountedRef]);

  return {
    login,
    register,
    logout,
  };
};
