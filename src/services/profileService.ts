import { supabase } from '@/integrations/supabase/client';
import { User, ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { mapUserFromProfile } from '@/utils/userMapper';
import { logger } from '@/utils/logger';

class ProfileService {
  async getCurrentProfile(): Promise<ApiResponse<User>> {
    try {
      logger.debug('Buscando perfil atual do usuário', undefined, 'PROFILE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao buscar perfil', undefined, 'PROFILE_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      // Buscar TODOS os campos necessários incluindo experience_points
      const { data, error } = await supabase
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
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Erro ao buscar perfil no banco', { error: error.message, userId: user.id }, 'PROFILE_SERVICE');
        throw error;
      }

      const userData = mapUserFromProfile(data, user);
      logger.info('Perfil atual carregado com sucesso', { 
        userId: user.id, 
        experiencePoints: data.experience_points 
      }, 'PROFILE_SERVICE');
      return createSuccessResponse(userData);
    } catch (error) {
      logger.error('Erro ao obter perfil atual', { error }, 'PROFILE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'PROFILE_GET'));
    }
  }

  async updateProfile(updates: Partial<{ username: string; avatar_url: string; phone: string }>): Promise<ApiResponse<User>> {
    try {
      logger.info('Atualizando perfil do usuário', { updates }, 'PROFILE_SERVICE');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao atualizar perfil', undefined, 'PROFILE_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('id, username, avatar_url, total_score, games_played, experience_points, pix_key, pix_holder_name, phone, created_at, updated_at')
        .single();

      if (error) {
        logger.error('Erro ao atualizar perfil no banco', { error: error.message, userId: user.id }, 'PROFILE_SERVICE');
        throw error;
      }

      const userData = mapUserFromProfile(data, user);
      logger.info('Perfil atualizado com sucesso', { userId: user.id }, 'PROFILE_SERVICE');
      return createSuccessResponse(userData);
    } catch (error) {
      logger.error('Erro ao atualizar perfil', { error }, 'PROFILE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'PROFILE_UPDATE'));
    }
  }

  async getTopPlayers(limit = 10): Promise<ApiResponse<any[]>> {
    try {
      logger.debug('Buscando top players', { limit }, 'PROFILE_SERVICE');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, total_score, games_played')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar top players', { error: error.message }, 'PROFILE_SERVICE');
        throw error;
      }

      if (!data) {
        logger.warn('Nenhum dado encontrado para top players', undefined, 'PROFILE_SERVICE');
        return createErrorResponse('Nenhum dado encontrado');
      }

      logger.info('Top players carregados', { count: data.length }, 'PROFILE_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao buscar top players', { error }, 'PROFILE_SERVICE');
      return createErrorResponse(handleServiceError(error, 'PROFILE_TOP_PLAYERS'));
    }
  }
}

export const profileService = new ProfileService();
