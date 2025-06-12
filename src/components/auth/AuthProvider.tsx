
import React from 'react';
import { AuthContext } from '@/hooks/useAuth';
import { useAuthProvider } from '@/hooks/useAuthProvider';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const authValue = useAuthProvider();

  logger.debug('AuthProvider renderizado', {
    isAuthenticated: authValue.isAuthenticated,
    isLoading: authValue.isLoading,
    hasUser: !!authValue.user,
    hasError: !!authValue.error
  }, 'AUTH_PROVIDER');

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
