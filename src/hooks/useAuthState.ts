
import { useAuthStateCore } from './useAuthStateCore';
import { useAuthRefs } from './useAuthRefs';

export const useAuthState = () => {
  const authState = useAuthStateCore();
  const authRefs = useAuthRefs();

  return {
    ...authState,
    ...authRefs,
  };
};
