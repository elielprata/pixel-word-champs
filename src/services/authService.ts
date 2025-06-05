
import { supabase } from '@/integrations/supabase/client';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('Tentando login com email:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Erro no login: dados incompletos');
      }

      console.log('Login bem-sucedido:', data.user.email);

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      const user: User = {
        id: data.user.id,
        username: profile?.username || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        avatar: profile?.avatar_url,
        createdAt: profile?.created_at || data.user.created_at,
        updatedAt: profile?.updated_at || data.user.updated_at || '',
        totalScore: profile?.total_score || 0,
        gamesPlayed: profile?.games_played || 0,
        bestDailyPosition: profile?.best_daily_position,
        bestWeeklyPosition: profile?.best_weekly_position
      };

      return {
        success: true,
        data: {
          user,
          token: data.session.access_token,
          refreshToken: data.session.refresh_token
        }
      };
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);
      
      let errorMessage = 'Erro no login';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu email antes de fazer login';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('Tentando registro com email:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            username: userData.username
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Erro no registro:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Erro no registro: usuário não criado');
      }

      console.log('Registro bem-sucedido:', data.user.email);

      // O perfil é criado automaticamente pelo trigger
      const user: User = {
        id: data.user.id,
        username: userData.username,
        email: userData.email,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || '',
        totalScore: 0,
        gamesPlayed: 0
      };

      return {
        success: true,
        data: {
          user,
          token: data.session?.access_token || '',
          refreshToken: data.session?.refresh_token || ''
        }
      };
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error);
      
      let errorMessage = 'Erro no registro';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
      } else if (error.message?.includes('Email address is invalid')) {
        errorMessage = 'Endereço de email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async logout(): Promise<void> {
    console.log('Fazendo logout...');
    await supabase.auth.signOut();
    console.log('Logout realizado');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error('Usuário não encontrado');

      // Buscar perfil completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userData: User = {
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        avatar: profile?.avatar_url,
        createdAt: profile?.created_at || user.created_at,
        updatedAt: profile?.updated_at || user.updated_at || '',
        totalScore: profile?.total_score || 0,
        gamesPlayed: profile?.games_played || 0,
        bestDailyPosition: profile?.best_daily_position,
        bestWeeklyPosition: profile?.best_weekly_position
      };

      return {
        success: true,
        data: userData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro ao buscar usuário'
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
}

export const authService = new AuthService();
