
import { useEffect, useRef } from 'react';
import { competitionStatusService } from '@/services/competitionStatusService';
import { logger } from '@/utils/logger';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  const lastCheckRef = useRef<number>(0);
  const competitionsHashRef = useRef<string>('');

  useEffect(() => {
    // Criar hash das competições para detectar mudanças reais
    const competitionsHash = competitions.map(c => `${c.id}-${c.status}`).join(',');
    
    // Evitar verificações desnecessárias
    if (competitionsHashRef.current === competitionsHash) return;
    
    // Implementar debounce de 5 segundos
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) return;
    
    lastCheckRef.current = now;
    competitionsHashRef.current = competitionsHash;

    // Apenas log de debug para verificar inconsistências (sem atualizações automáticas)
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
          }, 'COMPETITION_STATUS_UPDATER');
        }
      });
    }
  }, [competitions]);
};
