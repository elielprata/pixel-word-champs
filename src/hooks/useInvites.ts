
import { useState, useEffect } from 'react';
import { optimizedInviteService, type OptimizedInviteData } from '@/services/optimizedInviteService';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

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
        setData(response.data);
        setError(null);
        
        logger.debug('Dados de convite carregados', {
          totalPoints: response.data.stats.totalPoints,
          activeFriends: response.data.stats.activeFriends,
          userLevel: response.data.stats.userLevel
        }, 'USE_INVITES');
      } else {
        setError(response.error || 'Erro ao carregar dados de convites');
        setData(null);
      }
    } catch (err) {
      setError('Erro ao carregar dados de convites');
      logger.error('Erro ao carregar dados de convites:', err, 'USE_INVITES');
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

  // Auto-refresh com intervalo reduzido para dados mais frescos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadInviteData();
    }, 90 * 1000); // 1.5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    inviteCode: data?.inviteCode || '',
    invitedFriends: data?.invitedFriends || [],
    stats: data?.stats || { 
      totalPoints: 0, 
      activeFriends: 0, 
      totalInvites: 0,
      monthlyPoints: 0,
      userLevel: 1,
      nextLevel: 2,
      levelProgress: 0,
      totalScore: 0,
      experiencePoints: 0
    },
    isLoading,
    error,
    useInviteCode,
    refetch: loadInviteData
  };
};
