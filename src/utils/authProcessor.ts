
import { supabase } from '@/integrations/supabase/client';
import { createFallbackUser, createTimeoutPromise } from './authHelpers';
import { mapUserFromProfile } from './userMapper';
import { logger } from './logger';

interface AuthCallbacks {
  setUser: (user: any) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}

export const processUserAuthentication = async (
  session: any,
  callbacks: AuthCallbacks,
  isMountedRef: React.MutableRefObject<boolean>
) => {
  const { setUser, setIsAuthenticated, setIsLoading, setError } = callbacks;

  try {
    logger.debug('Processando autenticação do usuário', { 
      userId: session.user?.id,
      hasSession: !!session,
      emailConfirmed: session.user?.email_confirmed_at
    }, 'AUTH_PROCESSOR');

    setIsLoading(true);
    setError(undefined);

    // MUDANÇA PRINCIPAL: Verificar se o email foi confirmado
    const isEmailConfirmed = !!session.user?.email_confirmed_at;
    
    if (!isEmailConfirmed) {
      logger.info('Usuário com email não confirmado', { 
        userId: session.user?.id,
        email: session.user?.email 
      }, 'AUTH_PROCESSOR');
      
      // Definir usuário mas não como autenticado
      const fallbackUser = createFallbackUser(session);
      setUser(fallbackUser);
      setIsAuthenticated(false);
      setError(undefined);
      return;
    }

    // Buscar perfil com timeout de 3 segundos
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    try {
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        createTimeoutPromise(3000)
      ]);

      if (!isMountedRef.current) {
        logger.debug('Componente desmontado durante busca de perfil', undefined, 'AUTH_PROCESSOR');
        return;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        logger.warn('Erro ao buscar perfil, usando fallback', { 
          error: profileError.message 
        }, 'AUTH_PROCESSOR');
      }

      const userData = profile ? mapUserFromProfile(profile, session.user) : createFallbackUser(session);
      
      setUser(userData);
      setIsAuthenticated(true);
      setError(undefined);

      logger.info('Usuário autenticado com sucesso', { 
        userId: userData.id,
        username: userData.username,
        hasProfile: !!profile
      }, 'AUTH_PROCESSOR');

    } catch (timeoutError) {
      logger.warn('Timeout ou erro - usando fallback direto', { 
        error: timeoutError instanceof Error ? timeoutError.message : 'Timeout' 
      }, 'AUTH_PROCESSOR');

      if (!isMountedRef.current) return;

      const fallbackUser = createFallbackUser(session);
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setError(undefined);

      logger.info('Usuário autenticado com fallback', { 
        userId: fallbackUser.id,
        username: fallbackUser.username 
      }, 'AUTH_PROCESSOR');
    }

  } catch (error: any) {
    logger.error('Erro crítico na autenticação', { 
      error: error.message,
      userId: session.user?.id 
    }, 'AUTH_PROCESSOR');

    if (!isMountedRef.current) return;

    setError('Erro na autenticação');
    setIsAuthenticated(false);
    setUser(null);
  } finally {
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }
};
