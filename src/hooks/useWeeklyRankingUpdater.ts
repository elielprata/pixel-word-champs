
import { useEffect } from 'react';
import { weeklyRankingUpdateService } from '@/services/weeklyRankingUpdateService';
import { logger } from '@/utils/logger';

export const useWeeklyRankingUpdater = () => {
  useEffect(() => {
    const updateWeeklyRanking = async () => {
      try {
        logger.debug('Executando atualização automática do ranking semanal', undefined, 'WEEKLY_RANKING_UPDATER');
        await weeklyRankingUpdateService.updateWeeklyRankingFromParticipations();
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
