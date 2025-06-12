
import { useEffect } from 'react';
import { competitionStatusService } from '@/services/competitionStatusService';
import { logger } from '@/utils/logger';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  useEffect(() => {
    // Auto-update desabilitado para evitar loops infinitos
    // O status é calculado em tempo real nos componentes quando necessário
    logger.debug('useCompetitionStatusUpdater: Auto-update desabilitado para evitar loops');
    
    // Apenas log de debug para verificar se há inconsistências
    if (competitions.length > 0) {
      competitions.forEach(competition => {
        const actualStatus = competitionStatusService.calculateCorrectStatus({
          start_date: competition.start_date,
          end_date: competition.end_date,
          competition_type: competition.competition_type || 'tournament'
        });
        
        if (competition.status !== actualStatus) {
          logger.debug('Status inconsistency detected', {
            title: competition.title,
            dbStatus: competition.status,
            calculatedStatus: actualStatus
          });
        }
      });
    }
  }, [competitions]);
};
