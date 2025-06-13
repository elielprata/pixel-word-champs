
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { logger } from '@/utils/logger';

export const useAuthState = () => {
  const authState = useAuthStateCore();
  const authRefs = useAuthRefs();

  logger.debug('Hook useAuthState inicializado', {
    hasUser: !!authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading
  }, 'USE_AUTH_STATE');

  return {
    ...authState,
    ...authRefs,
  };
};
