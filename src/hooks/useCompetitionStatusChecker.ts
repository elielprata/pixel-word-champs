
import { useEffect, useRef } from 'react';
import { competitionTimeService } from '@/services/competitionTimeService';
import { logger } from '@/utils/logger';

export const useCompetitionStatusChecker = (enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const checkAndUpdateStatuses = async () => {
      if (isRunningRef.current) return;
      
      isRunningRef.current = true;
      try {
        logger.debug('Verificação automática de status iniciada (TEMPO REAL)', undefined, 'COMPETITION_STATUS_CHECKER');
        await competitionTimeService.updateCompetitionStatuses();
      } catch (error) {
        logger.error('Erro na verificação automática de status', { error }, 'COMPETITION_STATUS_CHECKER');
      } finally {
        isRunningRef.current = false;
      }
    };

    // Reduzir intervalo para 1 minuto (60 segundos)
    intervalRef.current = setInterval(checkAndUpdateStatuses, 60 * 1000);

    // Primeira verificação imediata
    checkAndUpdateStatuses();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [enabled]);
};
