
import { useState } from 'react';
import { User } from '@/types';
import { logger } from '@/utils/logger';

export const useAuthStateCore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  logger.debug('Auth state core inicializado', {
    hasUser: !!user,
    isAuthenticated,
    isLoading,
    hasError: !!error
  }, 'USE_AUTH_STATE_CORE');

  return {
    user,
    setUser: (newUser: User | null) => {
      logger.debug('Atualizando usuário no state', {
        previousUserId: user?.id,
        newUserId: newUser?.id
      }, 'USE_AUTH_STATE_CORE');
      setUser(newUser);
    },
    isAuthenticated,
    setIsAuthenticated: (auth: boolean) => {
      logger.debug('Atualizando status de autenticação', {
        previousAuth: isAuthenticated,
        newAuth: auth
      }, 'USE_AUTH_STATE_CORE');
      setIsAuthenticated(auth);
    },
    isLoading,
    setIsLoading: (loading: boolean) => {
      logger.debug('Atualizando status de loading', {
        previousLoading: isLoading,
        newLoading: loading
      }, 'USE_AUTH_STATE_CORE');
      setIsLoading(loading);
    },
    error,
    setError: (newError: string) => {
      if (newError) {
        logger.warn('Erro de autenticação definido', { error: newError }, 'USE_AUTH_STATE_CORE');
      } else {
        logger.debug('Erro de autenticação limpo', undefined, 'USE_AUTH_STATE_CORE');
      }
      setError(newError);
    },
  };
};
