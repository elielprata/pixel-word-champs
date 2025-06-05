import { useState, useEffect, createContext, useContext } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/authService';
import { useAsyncOperation } from './useAsyncOperation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  error: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loginOperation = useAsyncOperation<User>();
  const registerOperation = useAsyncOperation<User>();

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Token inválido, limpar
          await authService.logout();
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    await loginOperation.execute(async () => {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
      throw new Error(response.error || 'Erro no login');
    });
  };

  const register = async (userData: RegisterForm) => {
    await registerOperation.execute(async () => {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
      throw new Error(response.error || 'Erro no registro');
    });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading: loginOperation.isLoading || registerOperation.isLoading,
    login,
    register,
    logout,
    error: loginOperation.error || registerOperation.error,
  };
};

export { AuthContext };
