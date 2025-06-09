
import type { AuthContextType } from '@/types/auth';
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';
import { useAuthOperations } from './useAuthOperations';
import { useSessionProcessor } from './useSessionProcessor';
import { useAuthEffects } from './useAuthEffects';

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

  // Log do estado atual
  console.log('🎯 Estado atual do Auth:');
  console.log('- User:', user);
  console.log('- IsAuthenticated:', isAuthenticated);
  console.log('- IsLoading:', isLoading);
  console.log('- Error:', error);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    ...authOperations,
  };
};
