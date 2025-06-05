
import { LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/authService';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';

export const useAuthOperations = (
  authState: ReturnType<typeof useAuthStateCore>,
  authRefs: ReturnType<typeof useAuthRefs>
) => {
  const { 
    setUser, 
    setIsAuthenticated, 
    setIsLoading, 
    setError
  } = authState;

  const { lastProcessedSessionRef } = authRefs;

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
    login,
    register,
    logout,
  };
};
