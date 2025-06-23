
import React, { createContext, useContext } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { User } from '@/types';

interface SimpleAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any, onSuccess?: (email: string) => void) => Promise<any>;
  logout: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um SimpleAuthProvider');
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: React.ReactNode;
}

export const SimpleAuthProvider = ({ children }: SimpleAuthProviderProps) => {
  const auth = useSimpleAuth();

  return (
    <SimpleAuthContext.Provider value={auth}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
