
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface MonitoringFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'banned' | 'suspicious';
  minInvites: number;
}

interface MonitoringUser {
  id: string;
  username: string;
  avatar_url?: string;
  is_banned: boolean;
  banned_at?: string;
  ban_reason?: string;
  total_invites: number;
  processed_invites: number;
  pending_invites: number;
  total_rewards: number;
  suspicion_score: number;
  device_fingerprint?: string;
  last_invite_date?: string;
  invite_timeline: any[];
  invited_users: any[];
}

interface MonitoringStats {
  totalUsersWithInvites: number;
  highSuspicionUsers: number;
  uniqueFingerprints: number;
  suspiciousInvites: number;
}

export const useInviteMonitoringData = (filters: MonitoringFilters) => {
  const [data, setData] = useState<{
    users: MonitoringUser[];
    stats: MonitoringStats;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      logger.info('Buscando dados de monitoramento de indicações', filters, 'INVITE_MONITORING');

      // Buscar usuários com indicações e calcular métricas
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          is_banned,
          banned_at,
          ban_reason,
          invites!invites_invited_by_fkey(
            id,
            code,
            used_by,
            created_at,
            used_at,
            profiles!invites_used_by_fkey(
              id,
              username,
              games_played,
              total_score,
              created_at
            )
          ),
          invite_rewards!invite_rewards_user_id_fkey(
            id,
            reward_amount,
            status,
            processed_at,
            invited_user_id
          )
        `)
        .not('invites', 'is', null);

      if (usersError) {
        throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
      }

      // Processar dados e calcular scores de suspeita
      const processedUsers: MonitoringUser[] = usersData
        .filter(user => user.invites && user.invites.length > 0)
        .map(user => {
          const invites = user.invites || [];
          const rewards = user.invite_rewards || [];
          
          const totalInvites = invites.length;
          const processedInvites = rewards.filter(r => r.status === 'processed').length;
          const pendingInvites = rewards.filter(r => r.status === 'pending').length;
          const totalRewards = rewards.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

          // Calcular score de suspeita
          let suspicionScore = 0;
          
          // Muitas indicações em pouco tempo
          const recentInvites = invites.filter(inv => {
            const inviteDate = new Date(inv.created_at);
            const daysDiff = (Date.now() - inviteDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
          });
          
          if (recentInvites.length >= 10) suspicionScore += 50;
          else if (recentInvites.length >= 5) suspicionScore += 30;

          // Usuários indicados inativos
          const inactiveInvites = invites.filter(inv => 
            inv.profiles && inv.profiles.games_played === 0
          );
          const inactiveRate = totalInvites > 0 ? inactiveInvites.length / totalInvites : 0;
          
          if (inactiveRate >= 0.8) suspicionScore += 40;
          else if (inactiveRate >= 0.5) suspicionScore += 20;

          // Padrões de nomenclatura similar
          const usernames = invites
            .filter(inv => inv.profiles?.username)
            .map(inv => inv.profiles.username.toLowerCase());
          
          const similarNames = usernames.filter(name => 
            usernames.some(otherName => 
              name !== otherName && 
              (name.includes(otherName) || otherName.includes(name))
            )
          );
          
          if (similarNames.length >= 3) suspicionScore += 25;

          // Volume alto de indicações
          if (totalInvites >= 50) suspicionScore += 20;
          else if (totalInvites >= 20) suspicionScore += 10;

          return {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            is_banned: user.is_banned,
            banned_at: user.banned_at,
            ban_reason: user.ban_reason,
            total_invites: totalInvites,
            processed_invites: processedInvites,
            pending_invites: pendingInvites,
            total_rewards: totalRewards,
            suspicion_score: Math.min(suspicionScore, 100),
            last_invite_date: invites.length > 0 ? 
              invites.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at 
              : undefined,
            invite_timeline: invites.map(inv => ({
              date: inv.created_at,
              invited_user: inv.profiles?.username || 'Usuário desconhecido',
              status: inv.used_by ? 'used' : 'pending'
            })),
            invited_users: invites.filter(inv => inv.profiles).map(inv => ({
              id: inv.profiles.id,
              username: inv.profiles.username,
              games_played: inv.profiles.games_played,
              total_score: inv.profiles.total_score,
              created_at: inv.profiles.created_at,
              invite_date: inv.created_at
            }))
          };
        })
        .filter(user => {
          // Aplicar filtros
          if (filters.minInvites > 0 && user.total_invites < filters.minInvites) return false;
          
          if (filters.searchTerm && !user.username.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            return false;
          }
          
          if (filters.statusFilter !== 'all') {
            switch (filters.statusFilter) {
              case 'banned':
                if (!user.is_banned) return false;
                break;
              case 'active':
                if (user.is_banned) return false;
                break;
              case 'suspicious':
                if (user.suspicion_score < 40) return false;
                break;
            }
          }
          
          return true;
        })
        .sort((a, b) => b.suspicion_score - a.suspicion_score);

      // Calcular estatísticas
      const stats: MonitoringStats = {
        totalUsersWithInvites: processedUsers.length,
        highSuspicionUsers: processedUsers.filter(u => u.suspicion_score >= 70).length,
        uniqueFingerprints: 0, // TODO: Implementar quando FingerprintJS estiver coletando dados
        suspiciousInvites: processedUsers.reduce((sum, u) => sum + (u.suspicion_score >= 40 ? u.total_invites : 0), 0)
      };

      setData({ users: processedUsers, stats });
      setError(null);
      
      logger.info('Dados de monitoramento carregados com sucesso', {
        usersCount: processedUsers.length,
        highSuspicionCount: stats.highSuspicionUsers
      }, 'INVITE_MONITORING');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      logger.error('Erro ao carregar dados de monitoramento', { error: errorMessage }, 'INVITE_MONITORING');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [filters.searchTerm, filters.statusFilter, filters.minInvites]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMonitoringData
  };
};
