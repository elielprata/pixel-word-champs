
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { weeklyPositionService } from '@/services/weeklyPositionService';
import { logger } from '@/utils/logger';

/**
 * Hook para gerenciar automaticamente as melhores posições semanais
 * Executa atualizações periódicas e responde a mudanças de usuário
 */
export const useWeeklyPositionManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const updatePositions = async () => {
      try {
        logger.debug('Executando atualização periódica das melhores posições', { userId: user.id }, 'WEEKLY_POSITION_MANAGER');
        await weeklyPositionService.updateBestWeeklyPositions();
      } catch (error) {
        logger.warn('Erro na atualização periódica das melhores posições', { error, userId: user.id }, 'WEEKLY_POSITION_MANAGER');
      }
    };

    // Executar uma vez quando o usuário for carregado
    updatePositions();

    // Executar a cada 5 minutos para manter as posições atualizadas
    const interval = setInterval(updatePositions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  /**
   * Função para forçar atualização manual das posições
   */
  const forceUpdatePositions = async () => {
    try {
      logger.info('Forçando atualização manual das melhores posições', { userId: user?.id }, 'WEEKLY_POSITION_MANAGER');
      await weeklyPositionService.updateBestWeeklyPositions();
      logger.info('Atualização manual das melhores posições concluída', { userId: user?.id }, 'WEEKLY_POSITION_MANAGER');
    } catch (error) {
      logger.error('Erro na atualização manual das melhores posições', { error, userId: user?.id }, 'WEEKLY_POSITION_MANAGER');
      throw error;
    }
  };

  /**
   * Função para obter a posição atual do usuário
   */
  const getCurrentPosition = async () => {
    if (!user?.id) return null;

    try {
      return await weeklyPositionService.getUserCurrentWeeklyPosition(user.id);
    } catch (error) {
      logger.error('Erro ao obter posição atual do usuário', { error, userId: user.id }, 'WEEKLY_POSITION_MANAGER');
      return null;
    }
  };

  return {
    forceUpdatePositions,
    getCurrentPosition
  };
};
