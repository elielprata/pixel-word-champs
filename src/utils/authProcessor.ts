
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
    logger.info('🔐 INICIANDO PROCESSAMENTO DE AUTENTICAÇÃO', { 
      userId: session.user?.id,
      hasSession: !!session,
      timestamp: new Date().toISOString()
    }, 'AUTH_PROCESSOR');

    // PRIORIDADE 1: Definir autenticado IMEDIATAMENTE se há sessão válida
    if (session?.user?.id) {
      logger.info('✅ SESSÃO VÁLIDA DETECTADA - AUTENTICANDO IMEDIATAMENTE', { 
        userId: session.user.id 
      }, 'AUTH_PROCESSOR');
      
      setIsAuthenticated(true);
      setError(undefined);
      setIsLoading(true);

      // Criar usuário fallback temporário para evitar null state
      const tempUser = createFallbackUser(session);
      setUser(tempUser);
      
      logger.info('👤 USUÁRIO TEMPORÁRIO CRIADO', { 
        userId: tempUser.id,
        username: tempUser.username 
      }, 'AUTH_PROCESSOR');
    }

    // PRIORIDADE 2: Buscar perfil completo em background (timeout 10s)
    logger.debug('📊 Iniciando busca de perfil completo...', undefined, 'AUTH_PROCESSOR');
    
    const profilePromise = supabase
      .from('profiles')
      .select(`
        id,
        username,
        avatar_url,
        total_score,
        games_played,
        best_daily_position,
        best_weekly_position,
        pix_key,
        pix_holder_name,
        phone,
        experience_points,
        created_at,
        updated_at
      `)
      .eq('id', session.user.id)
      .single();

    try {
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        createTimeoutPromise(10000) // Aumentado para 10 segundos
      ]);

      if (!isMountedRef.current) {
        logger.debug('⚠️ Componente desmontado durante busca de perfil', undefined, 'AUTH_PROCESSOR');
        return;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        logger.warn('⚠️ Erro ao buscar perfil, mantendo fallback', { 
          error: profileError.message,
          code: profileError.code
        }, 'AUTH_PROCESSOR');
      }

      // PRIORIDADE 3: Atualizar com dados completos do perfil se disponível
      if (profile) {
        const fullUserData = mapUserFromProfile(profile, session.user);
        setUser(fullUserData);
        
        logger.info('🎯 PERFIL COMPLETO CARREGADO', { 
          userId: fullUserData.id,
          username: fullUserData.username,
          experiencePoints: fullUserData.experience_points,
          totalScore: fullUserData.total_score
        }, 'AUTH_PROCESSOR');
      } else {
        logger.info('📝 MANTENDO DADOS FALLBACK - perfil não encontrado', undefined, 'AUTH_PROCESSOR');
      }

    } catch (timeoutError) {
      logger.warn('⏰ TIMEOUT NA BUSCA DE PERFIL - mantendo autenticação ativa', { 
        error: timeoutError instanceof Error ? timeoutError.message : 'Timeout após 10s',
        fallbackActive: true
      }, 'AUTH_PROCESSOR');

      // Usuário continua autenticado com dados fallback
      if (!isMountedRef.current) return;
    }

  } catch (error: any) {
    logger.error('❌ ERRO CRÍTICO NA AUTENTICAÇÃO', { 
      error: error.message,
      userId: session?.user?.id,
      stack: error.stack
    }, 'AUTH_PROCESSOR');

    if (!isMountedRef.current) return;

    setError('Erro na autenticação');
    setIsAuthenticated(false);
    setUser(null);
  } finally {
    if (isMountedRef.current) {
      setIsLoading(false);
      logger.info('🏁 PROCESSAMENTO DE AUTENTICAÇÃO FINALIZADO', { 
        timestamp: new Date().toISOString()
      }, 'AUTH_PROCESSOR');
    }
  }
};
