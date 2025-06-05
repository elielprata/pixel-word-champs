
import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';
import { User } from '@/types';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getCurrentProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Erro ao carregar perfil');
      }
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<{ username: string; avatar_url: string }>) => {
    try {
      const response = await profileService.updateProfile(updates);
      if (response.success) {
        setProfile(response.data);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};
