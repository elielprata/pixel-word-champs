
import { useState, useEffect } from 'react';
import { inviteService, InviteCode, InvitedFriend, InviteStats } from '@/services/inviteService';
import { logger } from '@/utils/logger';

export const useInvites = () => {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([]);
  const [stats, setStats] = useState<InviteStats>({ totalInvites: 0, successfulInvites: 0, totalRewards: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = async () => {
    try {
      const code = await inviteService.generateInviteCode();
      
      if (code) {
        await fetchInvites(); // Refresh the list
        logger.info('Código de convite gerado com sucesso no hook', { code }, 'USE_INVITES');
        return { success: true, data: code };
      } else {
        const errorMessage = 'Erro ao gerar código de convite';
        logger.error('Falha ao gerar código de convite no hook', undefined, 'USE_INVITES');
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar código de convite';
      logger.error('Erro crítico ao gerar código de convite no hook', { error: err }, 'USE_INVITES');
      return { success: false, error: errorMessage };
    }
  };

  const fetchInvites = async () => {
    try {
      const result = await inviteService.getUserInvites();
      setInvites(result);
      logger.debug('Convites carregados no hook', { count: result.length }, 'USE_INVITES');
    } catch (err) {
      logger.error('Erro ao carregar convites no hook', { error: err }, 'USE_INVITES');
    }
  };

  const fetchInvitedFriends = async () => {
    try {
      const result = await inviteService.getInvitedFriends();
      setInvitedFriends(result);
      logger.debug('Amigos convidados carregados no hook', { count: result.length }, 'USE_INVITES');
    } catch (err) {
      logger.error('Erro ao carregar amigos convidados no hook', { error: err }, 'USE_INVITES');
    }
  };

  const fetchStats = async () => {
    try {
      const result = await inviteService.getInviteStats();
      setStats(result);
      logger.debug('Estatísticas de convites carregadas no hook', { stats: result }, 'USE_INVITES');
    } catch (err) {
      logger.error('Erro ao carregar estatísticas no hook', { error: err }, 'USE_INVITES');
    }
  };

  const useInviteCode = async (code: string) => {
    try {
      const success = await inviteService.useInviteCode(code);
      
      if (success) {
        logger.info('Código de convite usado com sucesso no hook', { code }, 'USE_INVITES');
        return { success: true };
      } else {
        const errorMessage = 'Código de convite inválido ou já usado';
        logger.warn('Falha ao usar código de convite no hook', { code }, 'USE_INVITES');
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao usar código de convite';
      logger.error('Erro crítico ao usar código de convite no hook', { code, error: err }, 'USE_INVITES');
      return { success: false, error: errorMessage };
    }
  };

  const validateInviteCode = async (code: string) => {
    try {
      const isValid = await inviteService.validateInviteCode(code);
      logger.debug('Código de convite validado no hook', { code, isValid }, 'USE_INVITES');
      return isValid;
    } catch (err) {
      logger.error('Erro ao validar código de convite no hook', { code, error: err }, 'USE_INVITES');
      return false;
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchInvites(),
        fetchInvitedFriends(),
        fetchStats()
      ]);
      
      logger.debug('Todos os dados de convites carregados no hook', undefined, 'USE_INVITES');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados de convites';
      setError(errorMessage);
      logger.error('Erro crítico ao carregar dados de convites no hook', { error: err }, 'USE_INVITES');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    invites,
    invitedFriends,
    stats,
    loading,
    error,
    generateInviteCode,
    useInviteCode,
    validateInviteCode,
    refetch: fetchAllData
  };
};
