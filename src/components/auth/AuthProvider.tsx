
import React, { ReactNode } from 'react';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authValue = useAuthProvider();
  
  logger.debug('AuthProvider renderizado', { isAuthenticated: authValue.isAuthenticated }, 'AUTH_PROVIDER');

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
