
import { createContext, useContext } from 'react';
import type { AuthContextType } from '@/types/auth';
import { logger } from '@/utils/logger';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    logger.error('useAuth chamado fora do AuthProvider', undefined, 'USE_AUTH');
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  logger.debug('useAuth context acessado', {
    hasUser: !!context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading
  }, 'USE_AUTH');
  
  return context;
};

export { useAuthProvider } from './useAuthProvider';
