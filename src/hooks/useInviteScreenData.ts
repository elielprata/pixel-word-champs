
import { useState, useEffect } from 'react';
import { optimizedInviteService } from '@/services/optimizedInviteService';
import { useMonthlyInviteCompetitionSimplified } from './useMonthlyInviteCompetitionSimplified';
import { useAuth } from './useAuth';

export interface InviteScreenData {
  // Dados de convites regulares
  inviteCode: string;
  invitedFriends: any[];
  stats: { totalPoints: number; activeFriends: number; totalInvites: number };
  
  // Dados da competição mensal
  monthlyCompetition: any;
  
  // Estados
  isLoading: boolean;
  error: string | null;
}

export const useInviteScreenData = () => {
  const [data, setData] = useState<InviteScreenData>({
    inviteCode: '',
    invitedFriends: [],
    stats: { totalPoints: 0, activeFriends: 0, totalInvites: 0 },
    monthlyCompetition: null,
    isLoading: true,
    error: null
  });
  
  const { isAuthenticated, user } = useAuth();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyInviteCompetitionSimplified();

  const loadInviteData = async () => {
    if (!isAuthenticated) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await optimizedInviteService.getOptimizedInviteData();
      
      if (response.success && response.data) {
        setData(prev => ({
          ...prev,
          inviteCode: response.data?.inviteCode || '',
          invitedFriends: response.data?.invitedFriends || [],
          stats: response.data?.stats || { totalPoints: 0, activeFriends: 0, totalInvites: 0 },
          error: null
        }));
      } else {
        setData(prev => ({
          ...prev,
          error: response.error || 'Erro ao carregar dados de convites'
        }));
      }
    } catch (err) {
      setData(prev => ({
        ...prev,
        error: 'Erro ao carregar dados de convites'
      }));
      console.error('Erro ao carregar dados de convites:', err);
    }
  };

  // Atualizar dados da competição mensal quando disponível
  useEffect(() => {
    if (monthlyData) {
      setData(prev => ({
        ...prev,
        monthlyCompetition: monthlyData
      }));
    }
  }, [monthlyData]);

  // Definir loading geral baseado em ambos os loadings
  useEffect(() => {
    const isGeneralLoading = data.isLoading || monthlyLoading;
    if (data.isLoading !== isGeneralLoading) {
      setData(prev => ({ ...prev, isLoading: isGeneralLoading }));
    }
  }, [monthlyLoading, data.isLoading]);

  useEffect(() => {
    loadInviteData();
  }, [isAuthenticated]);

  // Auto-refresh a cada 5 minutos (alinhado com cache do serviço)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadInviteData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const useInviteCode = async (code: string) => {
    const response = await optimizedInviteService.useInviteCode(code);
    if (response.success) {
      await loadInviteData();
    }
    return response;
  };

  return {
    ...data,
    useInviteCode,
    refetch: loadInviteData
  };
};
