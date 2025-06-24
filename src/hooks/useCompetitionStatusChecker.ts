
import { useEffect, useRef } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';

export const useCompetitionStatusChecker = (enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const checkAndUpdateStatuses = async () => {
      // Evitar execuções simultâneas
      if (isRunningRef.current) return;
      
      isRunningRef.current = true;
      try {
        logger.debug('Verificação automática de status iniciada (BRASÍLIA)', undefined, 'COMPETITION_STATUS_CHECKER');
        await competitionTimeService.updateCompetitionStatuses();
      } catch (error) {
        logger.error('Erro na verificação automática de status', { error }, 'COMPETITION_STATUS_CHECKER');
      } finally {
        isRunningRef.current = false;
      }
    };

    // Executar verificação a cada 10 minutos (reduzindo frequência)
    intervalRef.current = setInterval(checkAndUpdateStatuses, 10 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [enabled]);
};
