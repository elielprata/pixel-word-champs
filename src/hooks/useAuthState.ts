import { useAuthStateCore } from '@/hooks/auth/useAuthStateCore';
import { useAuthRefs } from '@/hooks/auth/useAuthRefs';

export const useAuthState = () => {
  const authState = useAuthStateCore();
  const authRefs = useAuthRefs();

  return {
    ...authState,
    ...authRefs,
  };
};
