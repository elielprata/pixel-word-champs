
import { useEffect, useRef } from 'react';
import { competitionFinalizationService } from '@/services/competitionFinalizationService';
import { logger } from '@/utils/logger';

interface Competition {
  id: string;
  title: string;
  status: string;
  end_date: string;
  competition_type: string;
}

export const useCompetitionFinalization = (competitions: Competition[]) => {
  const processedCompetitions = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAndFinalizeCompetitions = async () => {
      if (!competitions || competitions.length === 0) return;

      logger.info('🔍 Verificando competições para finalização', { 
        total: competitions.length 
      }, 'COMPETITION_FINALIZATION');

      for (const competition of competitions) {
        // Verificar se é uma competição que acabou de ser finalizada
        if (
          competition.status === 'completed' && 
          !processedCompetitions.current.has(competition.id)
        ) {
          logger.info('🏁 Competição detectada como finalizada, iniciando processo', {
            id: competition.id,
            title: competition.title,
            type: competition.competition_type
          }, 'COMPETITION_FINALIZATION');

          try {
            if (competition.competition_type === 'tournament') {
              await competitionFinalizationService.finalizeWeeklyCompetition(competition.id);
              logger.info('✅ Competição semanal finalizada com sucesso', {
                id: competition.id,
                title: competition.title
              }, 'COMPETITION_FINALIZATION');
            } else if (competition.competition_type === 'challenge') {
              await competitionFinalizationService.finalizeDailyCompetition(competition.id);
              logger.info('✅ Competição diária finalizada com sucesso', {
                id: competition.id,
                title: competition.title
              }, 'COMPETITION_FINALIZATION');
            }

            // Marcar como processada
            processedCompetitions.current.add(competition.id);
          } catch (error) {
            logger.error('❌ Erro ao finalizar competição', {
              id: competition.id,
              title: competition.title,
              error: error
            }, 'COMPETITION_FINALIZATION');
          }
        }
      }
    };

    checkAndFinalizeCompetitions();
  }, [competitions]);

  return {
    processedCompetitions: processedCompetitions.current
  };
};
