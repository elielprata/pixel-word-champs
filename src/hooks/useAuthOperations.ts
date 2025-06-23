
import { useCallback } from 'react';
import { authService } from '@/services/authService';
import { LoginForm, RegisterForm } from '@/types';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
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
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      const errorMessage = error.message || 'Erro de conexão';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      logger.error('Erro durante login', { error: errorMessage }, 'AUTH_OPERATIONS');
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError, isMountedRef]);

  const register = useCallback(async (userData: RegisterForm) => {
    if (!isMountedRef.current) return;
    
    console.log('🔍 [DEBUG] useAuthOperations.register iniciado');
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 [DEBUG] Chamando authService.register...');
      const response = await authService.register(userData);
      
      if (!isMountedRef.current) return;

      console.log('🔍 [DEBUG] Resposta do authService:', { success: response.success, hasUser: !!response.data?.user });

      if (response.success && response.data) {
        console.log('🔍 [DEBUG] Registro bem-sucedido, definindo usuário...');
        setUser(response.data.user);
        setIsAuthenticated(false); // Manter como false até confirmação
        setError('');
        logger.info('Registro realizado com sucesso', { userId: response.data.user.id }, 'AUTH_OPERATIONS');
        console.log('🔍 [DEBUG] Estado definido, retornando normalmente (sem throw)');
        return; // Retorna normalmente - sucesso
      } else {
        const errorMessage = response.error || 'Erro no registro';
        console.log('🔍 [DEBUG] Erro na resposta:', errorMessage);
        setError(errorMessage);
        setIsAuthenticated(false);
        setUser(null);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      console.log('🔍 [DEBUG] Exceção capturada:', error.message);
      const errorMessage = error.message || 'Erro de conexão';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      if (isMountedRef.current) {
        console.log('🔍 [DEBUG] Finalizando register, setIsLoading(false)');
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
