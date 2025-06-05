
import { supabase } from '@/integrations/supabase/client';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { mapUserFromProfile } from '@/utils/userMapper';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error('Erro no login: dados incompletos');
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      const user = mapUserFromProfile(profile, data.user);

      return createSuccessResponse({
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      });
    } catch (error: any) {
      return createErrorResponse(handleServiceError(error, 'AUTH_LOGIN'));
    }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username
          }
        }
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('Erro no registro: usuário não criado');
      }

      const user: User = {
        id: data.user.id,
        username: userData.username,
        email: userData.email,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || '',
        total_score: 0,
        games_played: 0
      };

      return createSuccessResponse({
        user,
        token: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || ''
      });
    } catch (error: any) {
      return createErrorResponse(handleServiceError(error, 'AUTH_REGISTER'));
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
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

      const userData = mapUserFromProfile(profile, user);
      return createSuccessResponse(userData);
    } catch (error: any) {
      return createErrorResponse(handleServiceError(error, 'AUTH_GET_USER'));
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
