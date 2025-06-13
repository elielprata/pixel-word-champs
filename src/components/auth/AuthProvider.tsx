
import React from 'react';
import { useAuthProvider, AuthContext } from '@/hooks/useAuth';
import { useAuthCleanup } from '@/hooks/useAuthCleanup';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  logger.debug('AuthProvider inicializando', undefined, 'AUTH_PROVIDER');
  
  const auth = useAuthProvider();
  
  // Executar limpeza automática na inicialização
  useAuthCleanup();

  logger.debug('AuthProvider configurado', {
    hasUser: !!auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading
  }, 'AUTH_PROVIDER');

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
