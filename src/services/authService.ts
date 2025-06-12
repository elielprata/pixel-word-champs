
import { supabase } from '@/integrations/supabase/client';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { mapUserFromProfile } from '@/utils/userMapper';
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/validation';
import { logger } from '@/utils/logger';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validações básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Validação de email
      if (!validateEmail(credentials.email)) {
        throw new Error('Email inválido');
      }

      // Sanitização de inputs
      const sanitizedEmail = sanitizeInput(credentials.email);

      logger.info('Tentativa de login iniciada', { email: sanitizedEmail }, 'AUTH_SERVICE');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: credentials.password
      });

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error('Erro no login: dados incompletos');
      }

      // Buscar perfil com timeout mais curto
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 2000)
      );

      let profile = null;
      try {
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (profileError && profileError.code !== 'PGRST116') {
          logger.warn('Erro ao buscar perfil, usando fallback', { error: profileError.message }, 'AUTH_SERVICE');
        } else {
          profile = profileData;
        }
      } catch (timeoutError) {
        logger.warn('Timeout ao buscar perfil, usando dados básicos da auth', undefined, 'AUTH_SERVICE');
      }

      const user = mapUserFromProfile(profile, data.user);

      logger.info('Login realizado com sucesso', { userId: user.id, username: user.username }, 'AUTH_SERVICE');

      return createSuccessResponse({
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      });
    } catch (error: any) {
      logger.error('Erro no login', { error: error.message }, 'AUTH_SERVICE');
      return createErrorResponse(handleServiceError(error, 'AUTH_LOGIN'));
    }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validações básicas
      if (!userData.email || !userData.password || !userData.username) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Validação de email
      if (!validateEmail(userData.email)) {
        throw new Error('Email inválido');
      }

      // Validação de senha
      if (!validatePassword(userData.password)) {
        throw new Error('Senha deve ter pelo menos 8 caracteres com maiúscula, minúscula e número');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }

      // Sanitização de inputs
      const sanitizedEmail = sanitizeInput(userData.email);
      const sanitizedUsername = sanitizeInput(userData.username);

      logger.info('Tentativa de registro iniciada', { email: sanitizedEmail, username: sanitizedUsername }, 'AUTH_SERVICE');

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: userData.password,
        options: {
          data: {
            username: sanitizedUsername
          }
        }
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error('Erro no registro: usuário não criado');
      }

      const user: User = {
        id: data.user.id,
        username: sanitizedUsername,
        email: sanitizedEmail,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: data.user.updated_at || new Date().toISOString(),
        total_score: 0,
        games_played: 0
      };

      logger.info('Registro realizado com sucesso', { userId: user.id, username: user.username }, 'AUTH_SERVICE');

      return createSuccessResponse({
        user,
        token: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || ''
      });
    } catch (error: any) {
      logger.error('Erro no registro', { error: error.message }, 'AUTH_SERVICE');
      return createErrorResponse(handleServiceError(error, 'AUTH_REGISTER'));
    }
  }

  async logout(): Promise<void> {
    try {
      logger.info('Logout iniciado', undefined, 'AUTH_SERVICE');
      await supabase.auth.signOut();
      logger.info('Logout realizado com sucesso', undefined, 'AUTH_SERVICE');
    } catch (error: any) {
      logger.error('Erro no logout', { error: error.message }, 'AUTH_SERVICE');
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error('Usuário não encontrado');

      // Buscar perfil com timeout mais curto
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1500)
      );

      let profile = null;
      try {
        const { data: profileData } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;
        profile = profileData;
      } catch {
        logger.warn('Timeout ao buscar perfil completo, usando dados básicos', undefined, 'AUTH_SERVICE');
      }

      const userData = mapUserFromProfile(profile, user);
      logger.debug('Usuário atual obtido', { userId: userData.id, username: userData.username }, 'AUTH_SERVICE');
      
      return createSuccessResponse(userData);
    } catch (error: any) {
      logger.error('Erro ao obter usuário atual', { error: error.message }, 'AUTH_SERVICE');
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
