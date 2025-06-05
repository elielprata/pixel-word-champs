
import { useState, useEffect, createContext, useContext } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  error: string | undefined;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Verificar estado inicial de autenticação
  useEffect(() => {
    console.log('Iniciando verificação de autenticação...');
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Sessão encontrada:', !!session, 'Erro:', sessionError);
        
        if (session?.user) {
          console.log('Usuário da sessão:', session.user.email);
          const response = await authService.getCurrentUser();
          console.log('Response do getCurrentUser:', response);
          
          if (response.success && response.data) {
            console.log('Definindo usuário autenticado:', response.data.username);
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            console.log('Erro ao obter dados do usuário:', response.error);
            // Se há sessão mas falha em obter dados, ainda considera autenticado
            setIsAuthenticated(true);
            setUser({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              createdAt: session.user.created_at,
              updatedAt: session.user.updated_at || '',
              totalScore: 0,
              gamesPlayed: 0
            });
          }
        } else {
          console.log('Nenhuma sessão encontrada');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('Verificação de autenticação concluída');
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processando login para:', session.user.email);
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            console.log('Login realizado:', response.data.username);
          } else {
            // Fallback se getCurrentUser falhar
            setIsAuthenticated(true);
            setUser({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              createdAt: session.user.created_at,
              updatedAt: session.user.updated_at || '',
              totalScore: 0,
              gamesPlayed: 0
            });
            console.log('Login realizado com dados básicos');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          console.log('Logout realizado');
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setError(response.error || 'Erro no login');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro inesperado no login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setError(response.error || 'Erro no registro');
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Erro inesperado no registro');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
  };
};
