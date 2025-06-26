
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
    
    // Implementar debounce de 2 segundos (reduzido)
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) return;
    
    lastCheckRef.current = now;
    competitionsHashRef.current = competitionsHash;

    // Atualizar status inconsistentes automaticamente
    if (competitions.length > 0) {
      competitions.forEach(async (competition) => {
        const actualStatus = competitionStatusService.calculateCorrectStatus({
          start_date: competition.start_date,
          end_date: competition.end_date,
          competition_type: competition.competition_type || 'tournament'
        });
        
        if (competition.status !== actualStatus) {
          logger.info('Atualizando status inconsistente automaticamente', {
            title: competition.title,
            currentStatus: competition.status,
            correctStatus: actualStatus,
            competitionId: competition.id
          }, 'COMPETITION_STATUS_UPDATER');
          
          // Atualizar status no banco de dados
          try {
            await competitionStatusService.updateSingleCompetitionStatus(competition.id, actualStatus);
            logger.info('Status atualizado com sucesso', {
              competitionId: competition.id,
              newStatus: actualStatus
            }, 'COMPETITION_STATUS_UPDATER');
          } catch (error) {
            logger.error('Erro ao atualizar status no banco', {
              competitionId: competition.id,
              error
            }, 'COMPETITION_STATUS_UPDATER');
          }
        }
      });
    }
  }, [competitions]);
};
