
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const debugAuthInfo = async () => {
  try {
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Chamar função de debug do banco
    const { data: dbDebugInfo, error: dbError } = await supabase.rpc('debug_auth_info');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      client_session: {
        user_id: session?.user?.id || null,
        access_token_present: !!session?.access_token,
        refresh_token_present: !!session?.refresh_token,
        expires_at: session?.expires_at || null,
        session_exists: !!session
      },
      database_auth: dbDebugInfo || null,
      errors: {
        session_error: sessionError?.message || null,
        db_error: dbError?.message || null
      }
    };

    logger.info('🔍 DEBUG AUTH INFO', debugInfo, 'AUTH_DEBUG');
    return debugInfo;
  } catch (error) {
    logger.error('❌ Erro ao obter informações de debug de auth', { error }, 'AUTH_DEBUG');
    return null;
  }
};
