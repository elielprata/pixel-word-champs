
import { supabase } from '@/integrations/supabase/client';
import { User, ApiResponse } from '@/types';

class ProfileService {
  async getCurrentProfile(): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          username: data.username,
          email: user.email || '',
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          total_score: data.total_score,
          games_played: data.games_played,
          best_daily_position: data.best_daily_position,
          best_weekly_position: data.best_weekly_position
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar perfil'
      };
    }
  }

  async updateProfile(updates: Partial<{ username: string; avatar_url: string }>): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          username: data.username,
          email: user.email || '',
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          total_score: data.total_score,
          games_played: data.games_played,
          best_daily_position: data.best_daily_position,
          best_weekly_position: data.best_weekly_position
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      };
    }
  }

  async getTopPlayers(limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, total_score, games_played')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar top jogadores'
      };
    }
  }
}

export const profileService = new ProfileService();
