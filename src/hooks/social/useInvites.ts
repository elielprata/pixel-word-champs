
import { useState, useEffect } from 'react';
import { inviteService, type InvitedFriend } from '@/services/inviteService';
import { useAuth } from './useAuth';

export const useInvites = () => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    activeFriends: 0,
    totalInvites: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadInviteData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Carregar código de convite
      const codeResponse = await inviteService.generateInviteCode();
      if (codeResponse.success && codeResponse.data) {
        setInviteCode((codeResponse.data as { code: string }).code);
      }

      // Carregar amigos convidados
      const friendsResponse = await inviteService.getInvitedFriends();
      if (friendsResponse.success && friendsResponse.data) {
        setInvitedFriends(friendsResponse.data as InvitedFriend[]);
      }

      // Carregar estatísticas
      const statsResponse = await inviteService.getInviteStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as { totalPoints: number; activeFriends: number; totalInvites: number; });
      }
    } catch (err) {
      setError('Erro ao carregar dados de convites');
      console.error('Erro ao carregar dados de convites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const useInviteCode = async (code: string) => {
    const response = await inviteService.useInviteCode(code);
    if (response.success) {
      // Recarregar dados após usar código
      await loadInviteData();
    }
    return response;
  };

  useEffect(() => {
    loadInviteData();
  }, [isAuthenticated]);

  return {
    inviteCode,
    invitedFriends,
    stats,
    isLoading,
    error,
    useInviteCode,
    refetch: loadInviteData
  };
};
