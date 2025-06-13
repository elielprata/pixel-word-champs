
import { useEffect } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';

export const useCompetitionStatusChecker = () => {
  useEffect(() => {
    const checkAndUpdateStatuses = async () => {
      try {
        logger.debug('Verificando status das competições automaticamente', undefined, 'COMPETITION_STATUS_CHECKER');
        await competitionTimeService.updateCompetitionStatuses();
      } catch (error) {
        logger.error('Erro na verificação automática de status', { error }, 'COMPETITION_STATUS_CHECKER');
      }
    };

    // Executar verificação imediatamente
    checkAndUpdateStatuses();

    // Executar verificação a cada 5 minutos
    const interval = setInterval(checkAndUpdateStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
