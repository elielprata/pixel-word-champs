
import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';
import { User } from '@/types';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Carregando perfil do usuário', { userId: user?.id }, 'USE_PROFILE');
      
      const response = await profileService.getCurrentProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setError(null);
        logger.info('Perfil carregado com sucesso', { username: response.data.username }, 'USE_PROFILE');
      } else {
        setError(response.error || 'Erro ao carregar perfil');
        setProfile(null);
        logger.error('Erro ao carregar perfil', { error: response.error }, 'USE_PROFILE');
      }
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
      setProfile(null);
      logger.error('Erro inesperado ao carregar perfil', { error: err }, 'USE_PROFILE');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<{ username: string; avatar_url: string; phone: string }>) => {
    try {
      logger.debug('Atualizando perfil', { updates }, 'USE_PROFILE');
      
      const response = await profileService.updateProfile(updates);
      if (response.success && response.data) {
        setProfile(response.data);
        logger.info('Perfil atualizado com sucesso', undefined, 'USE_PROFILE');
        return { success: true };
      } else {
        logger.error('Erro ao atualizar perfil', { error: response.error }, 'USE_PROFILE');
        return { success: false, error: response.error };
      }
    } catch (err) {
      logger.error('Erro inesperado ao atualizar perfil', { error: err }, 'USE_PROFILE');
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  // Sincronizar com mudanças de autenticação e usuário
  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user?.id]);

  // Sincronizar profile com user quando user é atualizado externamente
  useEffect(() => {
    if (user && !profile && !isLoading) {
      // Mapear user do Supabase para nosso tipo User
      const mappedUser: User = {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url,
        total_score: 0,
        games_played: 0,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString()
      };
      setProfile(mappedUser);
    }
  }, [user, profile, isLoading]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};
