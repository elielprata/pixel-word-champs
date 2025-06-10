
import { User } from '@/types';

export const mapUserFromProfile = (profile: any, authUser: any): User => ({
  id: profile.id || authUser.id,
  username: profile.username || authUser.email?.split('@')[0] || 'Usuário',
  email: authUser.email || '',
  avatar_url: profile.avatar_url,
  created_at: profile.created_at || authUser.created_at,
  updated_at: profile.updated_at || authUser.updated_at || '',
  total_score: profile.total_score || 0,
  games_played: profile.games_played || 0
});

export const createFallbackUser = (session: any): User => ({
  id: session.user.id,
  username: session.user.email?.split('@')[0] || 'Usuário',
  email: session.user.email || '',
  created_at: session.user.created_at,
  updated_at: session.user.updated_at || '',
  total_score: 0,
  games_played: 0
});
