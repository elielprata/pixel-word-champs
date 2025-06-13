import { useState, useEffect } from 'react';
import { inviteService } from '@/services/inviteService';
import { useAuth } from '@/hooks/auth/useAuth';
import { InviteData } from '@/types';
import { logger } from '@/utils/logger';

export const useInvites = () => {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { user } = useAuth();

  const fetchInvites = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Buscando convites do usuário', { userId: user.id }, 'INVITES_HOOK');
      const response = await inviteService.getInvites();
      if (response.success && response.data) {
        setInvites(response.data);
        logger.info('Convites carregados com sucesso', { count: response.data.length }, 'INVITES_HOOK');
      } else {
        setError(response.error || 'Erro ao carregar convites');
        logger.error('Erro ao carregar convites', { error: response.error }, 'INVITES_HOOK');
      }
    } catch (err) {
      setError('Erro ao carregar convites');
      logger.error('Erro ao carregar convites', { error: err }, 'INVITES_HOOK');
    } finally {
      setIsLoading(false);
    }
  };

  const createInvite = async (email: string) => {
    if (!user) return;

    setIsCreating(true);
    setError(null);

    try {
      logger.info('Criando convite', { targetEmail: email, userId: user.id }, 'INVITES_HOOK');
      const response = await inviteService.createInvite(email);
      if (response.success && response.data) {
        setInvites(prev => [...prev, response.data]);
        logger.info('Convite criado com sucesso', { inviteId: response.data.id }, 'INVITES_HOOK');
      } else {
        setError(response.error || 'Erro ao criar convite');
        logger.error('Erro ao criar convite', { error: response.error }, 'INVITES_HOOK');
      }
    } catch (err) {
      setError('Erro ao criar convite');
      logger.error('Erro ao criar convite', { error: err }, 'INVITES_HOOK');
    } finally {
      setIsCreating(false);
    }
  };

  const resendInvite = async (inviteId: string) => {
    if (!user) return;

    setIsResending(true);
    setError(null);

    try {
      logger.info('Reenviando convite', { inviteId, userId: user.id }, 'INVITES_HOOK');
      const response = await inviteService.resendInvite(inviteId);
      if (response.success) {
        setInvites(prev => prev.map(invite =>
          invite.id === inviteId ? { ...invite, status: 'pending' } : invite
        ));
        logger.info('Convite reenviado com sucesso', { inviteId }, 'INVITES_HOOK');
      } else {
        setError(response.error || 'Erro ao reenviar convite');
        logger.error('Erro ao reenviar convite', { error: response.error }, 'INVITES_HOOK');
      }
    } catch (err) {
      setError('Erro ao reenviar convite');
      logger.error('Erro ao reenviar convite', { error: err }, 'INVITES_HOOK');
    } finally {
      setIsResending(false);
    }
  };

  const claimInvite = async (inviteCode: string) => {
    setIsClaiming(true);
    setError(null);

    try {
      logger.info('Reivindicando convite', { inviteCode }, 'INVITES_HOOK');
      const response = await inviteService.claimInvite(inviteCode);
      if (response.success) {
        logger.info('Convite reivindicado com sucesso', { inviteCode }, 'INVITES_HOOK');
        return { success: true };
      } else {
        setError(response.error || 'Erro ao reivindicar convite');
        logger.error('Erro ao reivindicar convite', { error: response.error }, 'INVITES_HOOK');
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError('Erro ao reivindicar convite');
      logger.error('Erro ao reivindicar convite', { error: err }, 'INVITES_HOOK');
      return { success: false, error: 'Erro ao reivindicar convite' };
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [user]);

  return {
    invites,
    isLoading,
    error,
    isCreating,
    isResending,
    isClaiming,
    fetchInvites,
    createInvite,
    resendInvite,
    claimInvite
  };
};
