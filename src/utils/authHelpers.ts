
import { User } from '@/types';
import { logger } from '@/utils/logger';

export const createFallbackUser = (session: any): User => {
  if (!session?.user) {
    logger.error('Sessão inválida para criar usuário fallback', { hasSession: !!session }, 'AUTH_HELPERS');
    throw new Error('Sessão inválida para criar usuário fallback');
  }

  logger.debug('Criando usuário fallback', { userId: session.user.id }, 'AUTH_HELPERS');

  const fallbackUser: User = {
    id: session.user.id,
    username: session.user.user_metadata?.username || 
              session.user.email?.split('@')[0] || 
              'Usuário',
    email: session.user.email || '',
    created_at: session.user.created_at || new Date().toISOString(),
    updated_at: session.user.updated_at || new Date().toISOString(),
    total_score: 0,
    games_played: 0,
    // XP SEMPRE 0 no fallback - deve vir da base de dados
    experience_points: 0
  };

  logger.info('Usuário fallback criado', { 
    userId: fallbackUser.id, 
    username: fallbackUser.username 
  }, 'AUTH_HELPERS');

  return fallbackUser;
};

export const createTimeoutPromise = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => 
    setTimeout(() => {
      logger.warn('Timeout de operação atingido', { timeoutMs }, 'AUTH_HELPERS');
      reject(new Error('Timeout'));
    }, timeoutMs)
  );
};
