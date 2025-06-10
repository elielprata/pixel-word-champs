
import { supabase } from '@/integrations/supabase/client';
import { User, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { mapUserFromProfile } from '@/utils/userMapper';

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

      const userData = mapUserFromProfile(data, user);
      return createSuccessResponse(userData);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'PROFILE_GET'));
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

      const userData = mapUserFromProfile(data, user);
      return createSuccessResponse(userData);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'PROFILE_UPDATE'));
    }
  }

  async getTopPlayers(limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score, games_played')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (!data) {
        return createErrorResponse('Nenhum dado encontrado');
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'PROFILE_TOP_PLAYERS'));
    }
  }
}

export const profileService = new ProfileService();
