
import { useEffect } from 'react';
import { weeklyRankingUpdateService } from '@/services/weeklyRankingUpdateService';
import { weeklyPositionService } from '@/services/weeklyPositionService';
import { logger } from '@/utils/logger';

export const useWeeklyRankingUpdater = () => {
  useEffect(() => {
    const updateWeeklyRanking = async () => {
      try {
        logger.debug('Executando atualização automática do ranking semanal', undefined, 'WEEKLY_RANKING_UPDATER');
        await weeklyRankingUpdateService.updateWeeklyRankingFromParticipations();
        
        // Atualizar melhores posições semanais após atualização do ranking
        try {
          await weeklyPositionService.updateBestWeeklyPositions();
          logger.debug('Melhores posições semanais atualizadas após atualização do ranking', undefined, 'WEEKLY_RANKING_UPDATER');
        } catch (positionError) {
          logger.warn('Erro ao atualizar melhores posições semanais no updater', { error: positionError }, 'WEEKLY_RANKING_UPDATER');
        }
      } catch (error) {
        logger.error('Erro na atualização automática do ranking semanal', { error }, 'WEEKLY_RANKING_UPDATER');
      }
    };

    // Executar imediatamente
    updateWeeklyRanking();

    // Executar a cada 2 minutos
    const interval = setInterval(updateWeeklyRanking, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
