
import { User } from '@/types';
import { authService } from '@/services/authService';
import { createFallbackUser, createTimeoutPromise } from '@/utils/authHelpers';
import type { ApiResponse } from '@/types';
import { secureLogger } from '@/utils/secureLogger';

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

  secureLogger.debug('Processando autenticação do usuário', { 
    userId: session.user.id,
    email: session.user.email 
  }, 'AUTH_PROCESSOR');
  
  try {
    secureLogger.debug('Tentando getCurrentUser com timeout reduzido...', undefined, 'AUTH_PROCESSOR');
    
    const timeoutPromise = createTimeoutPromise(3000);
    const getUserPromise = authService.getCurrentUser();
    
    const response = await Promise.race([getUserPromise, timeoutPromise]) as ApiResponse<User>;
    
    if (!isMountedRef.current) return;
    
    if (response?.success && response?.data) {
      secureLogger.info('Usuário autenticado definido', { 
        userId: response.data.id, 
        username: response.data.username 
      }, 'AUTH_PROCESSOR');
      setUser(response.data);
      setIsAuthenticated(true);
      setError(undefined);
    } else {
      secureLogger.debug('getCurrentUser falhou, usando fallback direto', undefined, 'AUTH_PROCESSOR');
      const fallbackUser = createFallbackUser(session);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setError(undefined);
    }
  } catch (error: any) {
    secureLogger.warn('Timeout ou erro - usando fallback direto', { error: error.message }, 'AUTH_PROCESSOR');
    if (!isMountedRef.current) return;
    
    try {
      const fallbackUser = createFallbackUser(session);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setError(undefined);
    } catch (fallbackError: any) {
      secureLogger.error('Erro ao criar fallback user', { error: fallbackError.message }, 'AUTH_PROCESSOR');
      setIsAuthenticated(false);
      setUser(null);
      setError('Erro de autenticação');
    }
  } finally {
    if (isMountedRef.current) {
      secureLogger.debug('Finalizando processamento - definindo isLoading = false', undefined, 'AUTH_PROCESSOR');
      setIsLoading(false);
    }
  }
};
