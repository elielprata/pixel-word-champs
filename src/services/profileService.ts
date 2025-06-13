
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ProfileUpdateData {
  username?: string;
  avatar_url?: string;
  total_score?: number;
  games_played?: number;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  total_score: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

class ProfileService {
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      logger.debug('Buscando perfil do usuário atual', undefined, 'PROFILE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Tentativa de buscar perfil sem usuário autenticado', undefined, 'PROFILE_SERVICE');
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Perfil não encontrado para usuário', { userId: user.id }, 'PROFILE_SERVICE');
          return null;
        }
        logger.error('Erro ao buscar perfil no banco de dados', { 
          userId: user.id, 
          error 
        }, 'PROFILE_SERVICE');
        throw error;
      }

      logger.debug('Perfil carregado com sucesso', { 
        userId: user.id, 
        username: profile.username 
      }, 'PROFILE_SERVICE');

      return profile;
    } catch (error) {
      logger.error('Erro crítico ao buscar perfil', { error }, 'PROFILE_SERVICE');
      throw error;
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<Profile> {
    try {
      logger.info('Atualizando perfil do usuário', { 
        hasUsername: !!data.username,
        hasAvatarUrl: !!data.avatar_url,
        hasTotalScore: typeof data.total_score === 'number',
        hasGamesPlayed: typeof data.games_played === 'number'
      }, 'PROFILE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.error('Tentativa de atualizar perfil sem usuário autenticado', undefined, 'PROFILE_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar perfil no banco de dados', { 
          userId: user.id, 
          error 
        }, 'PROFILE_SERVICE');
        throw error;
      }

      logger.info('Perfil atualizado com sucesso', { 
        userId: user.id, 
        username: profile.username 
      }, 'PROFILE_SERVICE');

      return profile;
    } catch (error) {
      logger.error('Erro crítico ao atualizar perfil', { error }, 'PROFILE_SERVICE');
      throw error;
    }
  }

  async updateScore(newScore: number): Promise<boolean> {
    try {
      logger.info('Atualizando pontuação do usuário', { newScore }, 'PROFILE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.error('Tentativa de atualizar pontuação sem usuário autenticado', undefined, 'PROFILE_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          total_score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Erro ao atualizar pontuação no banco de dados', { 
          userId: user.id, 
          newScore, 
          error 
        }, 'PROFILE_SERVICE');
        throw error;
      }

      logger.info('Pontuação atualizada com sucesso', { 
        userId: user.id, 
        newScore 
      }, 'PROFILE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar pontuação', { 
        newScore, 
        error 
      }, 'PROFILE_SERVICE');
      throw error;
    }
  }

  async incrementGamesPlayed(): Promise<boolean> {
    try {
      logger.debug('Incrementando contador de jogos', undefined, 'PROFILE_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.error('Tentativa de incrementar jogos sem usuário autenticado', undefined, 'PROFILE_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase.rpc('increment_games_played', {
        user_id: user.id
      });

      if (error) {
        logger.error('Erro ao incrementar jogos no banco de dados', { 
          userId: user.id, 
          error 
        }, 'PROFILE_SERVICE');
        throw error;
      }

      logger.debug('Contador de jogos incrementado com sucesso', { 
        userId: user.id 
      }, 'PROFILE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao incrementar jogos', { error }, 'PROFILE_SERVICE');
      throw error;
    }
  }
}

export const profileService = new ProfileService();
