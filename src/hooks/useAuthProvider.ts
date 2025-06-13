
import type { AuthContextType } from '@/types/auth';
import { useAuthStateCore } from '@/hooks/auth/useAuthStateCore';
import { useAuthRefs } from '@/hooks/auth/useAuthRefs';
import { useAuthOperations } from './useAuthOperations';
import { useSessionProcessor } from '@/hooks/auth/useSessionProcessor';
import { useAuthEffects } from './useAuthEffects';
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

  // Log seguro do estado atual
  logger.debug('Estado atual do Auth', {
    userId: user?.id,
    username: user?.username,
    isAuthenticated,
    isLoading,
    hasError: !!error
  }, 'AUTH_PROVIDER');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    ...authOperations,
  };
};
