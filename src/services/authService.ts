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

      // Validação de senha mais flexível para permitir senhas simples
      if (userData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }

      // Sanitização de inputs
      const sanitizedEmail = sanitizeInput(userData.email);
      const sanitizedUsername = sanitizeInput(userData.username);

      logger.info('Tentativa de registro iniciada', { email: sanitizedEmail, username: sanitizedUsername }, 'AUTH_SERVICE');

      // CORREÇÃO PRINCIPAL: Adicionar emailRedirectTo no signUp
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: userData.password,
        options: {
          data: {
            username: sanitizedUsername
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        logger.error('Erro do Supabase Auth', { error: error.message }, 'AUTH_SERVICE');
        throw error;
      }

      if (!data.user) {
        throw new Error('Erro no registro: usuário não criado');
      }

      logger.info('Usuário criado no Supabase Auth', { userId: data.user.id, emailConfirmed: !!data.user.email_confirmed_at }, 'AUTH_SERVICE');

      // Aguardar um momento para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o perfil foi criado automaticamente
      let profile = null;
      let retries = 0;
      const maxRetries = 3;

      while (!profile && retries < maxRetries) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!profileError) {
            profile = profileData;
            logger.info('Perfil encontrado após trigger', { userId: data.user.id }, 'AUTH_SERVICE');
            break;
          }
        } catch (err) {
          logger.warn(`Tentativa ${retries + 1} de buscar perfil falhou`, { error: err }, 'AUTH_SERVICE');
        }

        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Se o perfil não foi criado automaticamente, criar manualmente (fallback)
      if (!profile) {
        logger.warn('Perfil não criado automaticamente, criando manualmente', { userId: data.user.id }, 'AUTH_SERVICE');
        
        try {
          const { data: manualProfile, error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: sanitizedUsername
            })
            .select()
            .single();

          if (!manualError) {
            profile = manualProfile;
            logger.info('Perfil criado manualmente', { userId: data.user.id }, 'AUTH_SERVICE');
          } else {
            logger.error('Erro ao criar perfil manualmente', { error: manualError.message }, 'AUTH_SERVICE');
          }
        } catch (manualErr: any) {
          logger.error('Falha na criação manual do perfil', { error: manualErr.message }, 'AUTH_SERVICE');
        }
      }

      // Verificar/criar role
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('role', 'user')
          .single();

        if (roleError || !roleData) {
          logger.info('Role não encontrada, criando role de usuário', { userId: data.user.id }, 'AUTH_SERVICE');
          
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'user'
            });

          if (insertRoleError) {
            logger.warn('Erro ao criar role manualmente', { error: insertRoleError.message }, 'AUTH_SERVICE');
          } else {
            logger.info('Role criada manualmente', { userId: data.user.id }, 'AUTH_SERVICE');
          }
        }
      } catch (roleErr: any) {
        logger.warn('Erro ao verificar/criar role', { error: roleErr.message }, 'AUTH_SERVICE');
      }

      // Criar objeto User com dados disponíveis
      const user: User = {
        id: data.user.id,
        username: profile?.username || sanitizedUsername,
        email: sanitizedEmail,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: data.user.updated_at || new Date().toISOString(),
        total_score: profile?.total_score || 0,
        games_played: profile?.games_played || 0,
        avatar_url: profile?.avatar_url,
        best_daily_position: profile?.best_daily_position,
        best_weekly_position: profile?.best_weekly_position
      };

      logger.info('Registro realizado com sucesso', { 
        userId: user.id, 
        username: user.username,
        hasProfile: !!profile,
        emailConfirmed: !!data.user.email_confirmed_at
      }, 'AUTH_SERVICE');

      return createSuccessResponse({
        user,
        token: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || ''
      });
    } catch (error: any) {
      logger.error('Erro no registro', { error: error.message }, 'AUTH_SERVICE');
      
      // Mensagens de erro mais amigáveis
      let errorMessage = "Erro ao criar conta";
      
      if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        errorMessage = "Este email já está registrado";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Senha muito fraca";
      } else if (error.message?.includes('signup is disabled')) {
        errorMessage = "Cadastro temporariamente desabilitado";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return createErrorResponse(errorMessage);
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
