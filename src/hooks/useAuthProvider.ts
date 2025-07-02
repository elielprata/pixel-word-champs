
import type { AuthContextType } from '@/types/auth';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { useAuthOperations } from './useAuthOperations';
import { useSessionProcessor } from './useSessionProcessor';
import { useAuthEffects } from './useAuthEffects';
import { useAuthDebug } from './useAuthDebug';
import { logger } from '@/utils/logger';

export const useAuthProvider = (): AuthContextType => {
  const authState = useAuthStateCore();
  const authRefs = useAuthRefs();
  const { processAuthentication } = useSessionProcessor(authState, authRefs);
  const authOperations = useAuthOperations(authState, authRefs);
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
  } = authState;

  // Use the new effects hook
  useAuthEffects(authState, authRefs, processAuthentication);

  // Debug hook para monitoramento
  useAuthDebug({ user, isAuthenticated, isLoading, error });

  // Log periódico do estado atual
  logger.debug('📊 Estado atual do Auth Provider', {
    userId: user?.id,
    username: user?.username,
    isAuthenticated,
    isLoading,
    hasError: !!error,
    timestamp: new Date().toISOString()
  }, 'AUTH_PROVIDER');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    ...authOperations,
  };
};
