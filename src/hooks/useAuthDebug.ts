import { useEffect } from 'react';
import { logger } from '@/utils/logger';

interface AuthDebugState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}

export const useAuthDebug = (authState: AuthDebugState) => {
  const { user, isAuthenticated, isLoading, error } = authState;

  useEffect(() => {
    const debugInfo = {
      isAuthenticated,
      isLoading,
      hasError: !!error,
      hasUser: !!user,
      userId: user?.id,
      username: user?.username,
      timestamp: new Date().toISOString()
    };

    logger.debug('🔍 Estado de autenticação atualizado', debugInfo, 'AUTH_DEBUG');

    // Log especial para transições importantes
    if (!isLoading && isAuthenticated && user) {
      logger.info('🎉 AUTENTICAÇÃO COMPLETADA COM SUCESSO', {
        userId: user.id,
        username: user.username,
        experiencePoints: user.experience_points,
        totalScore: user.total_score
      }, 'AUTH_DEBUG');
    }

    if (!isLoading && !isAuthenticated && !user) {
      logger.info('👋 Usuário não autenticado', undefined, 'AUTH_DEBUG');
    }

    if (error) {
      logger.error('❌ Erro de autenticação detectado', { error }, 'AUTH_DEBUG');
    }
  }, [user, isAuthenticated, isLoading, error]);
};