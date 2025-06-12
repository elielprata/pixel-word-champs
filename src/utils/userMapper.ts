
import { User } from '@/types';
import { logger } from '@/utils/logger';

export const mapUserFromProfile = (profile: any, authUser: any): User => {
  logger.debug('Mapeando usuário a partir do perfil', { 
    hasProfile: !!profile, 
    hasAuthUser: !!authUser,
    profileId: profile?.id,
    authUserId: authUser?.id 
  }, 'USER_MAPPER');

  const mappedUser: User = {
    id: profile.id || authUser.id,
    username: profile.username || authUser.email?.split('@')[0] || 'Usuário',
    email: authUser.email || '',
    avatar_url: profile.avatar_url,
    created_at: profile.created_at || authUser.created_at,
    updated_at: profile.updated_at || authUser.updated_at || '',
    total_score: profile.total_score || 0,
    games_played: profile.games_played || 0,
    best_daily_position: profile.best_daily_position,
    best_weekly_position: profile.best_weekly_position
  };

  logger.info('Usuário mapeado com sucesso', { 
    userId: mappedUser.id,
    username: mappedUser.username,
    totalScore: mappedUser.total_score 
  }, 'USER_MAPPER');

  return mappedUser;
};

export const createFallbackUser = (session: any): User => {
  logger.debug('Criando usuário fallback', { hasSession: !!session }, 'USER_MAPPER');

  const fallbackUser: User = {
    id: session.user.id,
    username: session.user.email?.split('@')[0] || 'Usuário',
    email: session.user.email || '',
    created_at: session.user.created_at,
    updated_at: session.user.updated_at || '',
    total_score: 0,
    games_played: 0
  };

  logger.info('Usuário fallback criado', { 
    userId: fallbackUser.id,
    username: fallbackUser.username 
  }, 'USER_MAPPER');

  return fallbackUser;
};
