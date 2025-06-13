
import { useState, useEffect } from 'react';
import { profileService, Profile, ProfileUpdateData } from '@/services/profileService';
import { logger } from '@/utils/logger';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await profileService.getCurrentProfile();
      
      if (result) {
        setProfile(result);
        logger.debug('Perfil carregado com sucesso no hook', { 
          userId: result.id 
        }, 'USE_PROFILE');
      } else {
        setProfile(null);
        logger.warn('Nenhum perfil encontrado', undefined, 'USE_PROFILE');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      setError(errorMessage);
      logger.error('Erro ao carregar perfil no hook', { error: err }, 'USE_PROFILE');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setError(null);
      
      const result = await profileService.updateProfile(data);
      
      if (result) {
        setProfile(result);
        logger.info('Perfil atualizado com sucesso no hook', { 
          userId: result.id 
        }, 'USE_PROFILE');
        return { success: true, data: result };
      } else {
        const errorMessage = 'Erro ao atualizar perfil';
        setError(errorMessage);
        logger.error('Falha ao atualizar perfil no hook', undefined, 'USE_PROFILE');
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      logger.error('Erro crítico ao atualizar perfil no hook', { error: err }, 'USE_PROFILE');
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};
