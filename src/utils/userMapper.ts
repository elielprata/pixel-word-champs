
import { User } from '@/types';

export const mapUserFromProfile = (profile: any, authUser?: any): User => {
  return {
    id: profile.id,
    email: authUser?.email || '',
    username: profile.username || '',
    avatar_url: profile.avatar_url,
    total_score: profile.total_score || 0,
    games_played: profile.games_played || 0,
    best_daily_position: profile.best_daily_position,
    best_weekly_position: profile.best_weekly_position,
    pix_key: profile.pix_key,
    pix_holder_name: profile.pix_holder_name,
    experience_points: profile.experience_points || 0, // Mapear campo de XP
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || ''
  };
};
