
import { useState, useEffect } from 'react';
import { optimizedInviteService, type OptimizedInviteData } from '@/services/optimizedInviteService';
import { useAuth } from './useAuth';

export const useInvites = () => {
  const [data, setData] = useState<OptimizedInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const loadInviteData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await optimizedInviteService.getOptimizedInviteData();
      
      if (response.success && response.data) {
        setData(response.data as OptimizedInviteData);
        setError(null);
      } else {
        setError(response.error || 'Erro ao carregar dados de convites');
        setData(null);
      }
    } catch (err) {
      setError('Erro ao carregar dados de convites');
      console.error('Erro ao carregar dados de convites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const useInviteCode = async (code: string) => {
    const response = await optimizedInviteService.useInviteCode(code);
    if (response.success) {
      // Recarregar dados após usar código
      await loadInviteData();
    }
    return response;
  };

  useEffect(() => {
    loadInviteData();
  }, [isAuthenticated]);

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadInviteData();
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    inviteCode: data?.inviteCode || '',
    invitedFriends: data?.invitedFriends || [],
    stats: data?.stats || { totalPoints: 0, activeFriends: 0, totalInvites: 0 },
    isLoading,
    error,
    useInviteCode,
    refetch: loadInviteData
  };
};
