
import { User } from '@/types';
import { authService } from '@/services/authService';
import { createFallbackUser, createTimeoutPromise } from '@/utils/authHelpers';
import type { ApiResponse } from '@/types';

export interface AuthProcessorCallbacks {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}

export const processUserAuthentication = async (
  session: any,
  callbacks: AuthProcessorCallbacks,
  isMountedRef: React.MutableRefObject<boolean>
): Promise<void> => {
  const { setUser, setIsAuthenticated, setIsLoading, setError } = callbacks;

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
  }
};
