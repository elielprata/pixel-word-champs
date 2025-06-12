
import { useEffect } from 'react';
import { competitionStatusService } from '@/services/competitionStatusService';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  useEffect(() => {
    // Removido auto-update para evitar loops infinitos
    // O status é calculado em tempo real nos componentes quando necessário
    console.log('ℹ️ [useCompetitionStatusUpdater] Auto-update desabilitado para evitar loops');
    
    // Apenas log de debug para verificar se há inconsistências
    if (competitions.length > 0) {
      competitions.forEach(competition => {
        const actualStatus = competitionStatusService.calculateCorrectStatus({
          start_date: competition.start_date,
          end_date: competition.end_date,
          competition_type: competition.competition_type || 'tournament'
        });
        
        if (competition.status !== actualStatus) {
          console.log(`📊 [Status Debug] "${competition.title}": DB=${competition.status}, Calculado=${actualStatus}`);
        }
      });
    }
  }, [competitions]);
};
